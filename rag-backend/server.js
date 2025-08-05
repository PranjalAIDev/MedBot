const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Import custom utilities
const { chunkText, cleanText, extractMedicalSections } = require('./utils/textProcessing');
const { generateEmbedding, storeChunksWithEmbeddings, findRelevantChunks } = require('./utils/embeddings');
const { extractMedicalEntities, createMedicalKnowledgeGraph } = require('./utils/medicalNER');
const { parseTestResults } = require('./utils/medicalDocParser');
const { findRelevantKnowledge } = require('./utils/knowledgeBase');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from frontend build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  const frontendPath = path.join(__dirname, '../frontend/dist/index.html');
  const frontendExists = fs.existsSync(frontendPath);
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    frontend_built: frontendExists,
    frontend_path: frontendPath
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'API OK',
    timestamp: new Date().toISOString()
  });
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "medBookRAG";
let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(mongoUri);
    console.log("Connected to MongoDB");
    db = client.db(dbName);

    // Create text index for basic search capabilities
    await db.collection("documents").createIndex({ content: "text" });

    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// Function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Note: chunkText function is now imported from utils/textProcessing.js

// Note: extractMedicalEntities function is now imported from utils/medicalNER.js

// Route to handle PDF upload and processing
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Extract text from PDF
    const rawText = await extractTextFromPDF(filePath);

    // Clean the extracted text
    const extractedText = cleanText(rawText);

    // Extract medical sections
    const sections = extractMedicalSections(extractedText);

    // Parse medical test results
    const testResults = parseTestResults(extractedText);
    console.log("Extracted test results:", JSON.stringify(testResults, null, 2));

    // Chunk the text with overlap for better context
    const chunks = chunkText(extractedText, 1000, 200);

    // Extract medical entities using specialized NLP
    const entities = await extractMedicalEntities(extractedText);

    // Create a simple medical knowledge graph
    const knowledgeGraph = createMedicalKnowledgeGraph(entities);

    // Store document and metadata in MongoDB (but NOT in vector embeddings)
    // Patient documents are stored separately from the knowledge base
    const document = {
      fileName: fileName,
      filePath: filePath,
      uploadDate: new Date(),
      content: extractedText,
      sections: sections,
      entities: entities,
      knowledgeGraph: knowledgeGraph,
      testResults: testResults, // Add the extracted test results
      chunks: chunks.map((chunk, index) => ({
        id: index,
        content: chunk.content,
      })),
    };    // Insert the document into MongoDB (patient documents collection)
    const result = await db.collection("documents").insertOne(document);

    // CORRECT RAG IMPLEMENTATION: Store patient document chunks with vector embeddings
    // This enables cosine similarity matching for document content retrieval
    try {
      console.log('Storing document chunks with embeddings for vector similarity...');
      await storeChunksWithEmbeddings(document, chunks, result.insertedId.toString());
      console.log('Successfully stored document vectors for similarity matching');
    } catch (embeddingError) {
      console.error('Error storing document embeddings (non-fatal):', embeddingError);
      // Continue even if embedding storage fails - basic functionality will still work
    }

    res.status(200).json({
      message: "Document processed successfully",
      documentId: result.insertedId,
      fileName: fileName,
      entities: entities,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

// Route to query the document
app.post("/api/query", async (req, res) => {
  try {
    const { query, documentId } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Find the document metadata
    let document;
    if (documentId) {
      document = await db.collection("documents").findOne({ _id: new ObjectId(documentId) });
    } else {
      // Get the most recent document if no ID is provided
      document = await db.collection("documents").findOne({}, { sort: { uploadDate: -1 } });
    }

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // CORRECT RAG APPROACH: Use external knowledge base to provide context
    // Step 1: Identify what medical topics the query is about
    const medicalCategories = [];
    const queryLower = query.toLowerCase();
    
    // Determine relevant medical categories based on query content
    if (queryLower.includes('cholesterol') || queryLower.includes('ldl') || queryLower.includes('hdl') || 
        queryLower.includes('triglyceride') || queryLower.includes('lipid') || queryLower.includes('heart') ||
        queryLower.includes('cardiovascular') || queryLower.includes('cardiac')) {
      medicalCategories.push('cardiovascular');
    }
    
    if (queryLower.includes('diabetes') || queryLower.includes('hba1c') || queryLower.includes('glucose') || 
        queryLower.includes('blood sugar') || queryLower.includes('insulin')) {
      medicalCategories.push('diabetes');
    }
    
    if (queryLower.includes('test') || queryLower.includes('lab') || queryLower.includes('result') || 
        queryLower.includes('value') || queryLower.includes('normal') || queryLower.includes('range')) {
      medicalCategories.push('laboratory');
    }
    
    if (queryLower.includes('treatment') || queryLower.includes('medication') || queryLower.includes('drug') || 
        queryLower.includes('therapy') || queryLower.includes('management')) {
      medicalCategories.push('treatment');
    }

    // Step 2: Find relevant external medical knowledge
    const relevantKnowledge = await findRelevantKnowledge(query, medicalCategories.length > 0 ? medicalCategories : null, 5);
      // Step 3: Extract relevant information from the patient document using VECTOR SIMILARITY
    let relevantDocumentSections = [];
    
    // PROPER RAG IMPLEMENTATION: Use vector similarity to find relevant document chunks
    try {
      // Use cosine similarity on document vectors to find most relevant content
      const relevantChunks = await findRelevantChunks(query, document._id.toString(), 5);
      
      if (relevantChunks.length > 0) {
        console.log(`Found ${relevantChunks.length} relevant chunks using vector similarity`);
        relevantDocumentSections = relevantChunks.map(chunk => {
          return `Document Content (similarity: ${chunk.similarity.toFixed(3)}): ${chunk.content}`;
        });
      } else {
        console.log('No vector chunks found, falling back to structured data search');
        
        // Fallback: Search in structured test results if vector search fails
        if (document.testResults && Object.keys(document.testResults).length > 0) {
          const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
          
          for (const [test, data] of Object.entries(document.testResults)) {
            const testName = data.name.toLowerCase();
            const testValue = data.value.toString().toLowerCase();
            
            // Check if query terms match this test result
            if (searchTerms.some(term => testName.includes(term) || testValue.includes(term) || test.includes(term))) {
              relevantDocumentSections.push(`Patient's ${data.name}: ${data.value} ${data.unit} (Normal range: ${data.normalRange}, Status: ${data.status})`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in vector similarity search:', error);
      
      // Emergency fallback to basic search if vector search completely fails
      if (document.testResults && Object.keys(document.testResults).length > 0) {
        for (const [test, data] of Object.entries(document.testResults)) {
          relevantDocumentSections.push(`Patient's ${data.name}: ${data.value} ${data.unit} (Normal range: ${data.normalRange}, Status: ${data.status})`);
        }
      }
    }

    // Check for cardiac-specific findings in the document
    if (queryLower.includes("abnormal") || queryLower.includes("diagnosis") || queryLower.includes("findings") || 
        queryLower.includes("hfpef") || queryLower.includes("heart failure") || queryLower.includes("diastolic") ||
        queryLower.includes("stenosis") || queryLower.includes("recommendation") || queryLower.includes("suggest")) {
      
      // Extract abnormal findings from document content
      const cardiacFindings = [];
      
      // Look for MCG, PCG, ECG findings
      if (document.content.includes("MCG Summary") || document.content.includes("ABNORMAL")) {
        const mcgMatch = document.content.match(/MCG Summary[\s\S]*?([A-Z]+)/i);
        if (mcgMatch) cardiacFindings.push(`MCG Summary: ${mcgMatch[1]}`);
      }
      
      if (document.content.includes("PCG Summary")) {
        const pcgMatch = document.content.match(/PCG Summary[\s\S]*?([A-Z]+)/i);
        if (pcgMatch) cardiacFindings.push(`PCG Summary: ${pcgMatch[1]}`);
      }
      
      if (document.content.includes("HFpEF-score")) {
        const hfpefMatch = document.content.match(/HFpEF-score[:\s]*([0-9]+)/i);
        if (hfpefMatch) {
          cardiacFindings.push(`HFpEF Score: ${hfpefMatch[1]} (Intermediate probability of heart failure with preserved ejection fraction)`);
          // Add specific categories for better knowledge retrieval
          medicalCategories.push('hfpef', 'heart_failure', 'diagnostic_criteria');
        }
      }
      
      if (document.content.includes("Impaired Relaxation") || document.content.includes("DDIM")) {
        cardiacFindings.push("Impaired Relaxation (DDIM): Mild - Early stage diastolic dysfunction");
        medicalCategories.push('diastolic_dysfunction', 'diagnostic_criteria');
      }
      
      if (document.content.includes("AV Stenosis") || document.content.includes("AS")) {
        const asMatch = document.content.match(/AS[\s\S]*?([A-Za-z]+)/i);
        if (asMatch) {
          cardiacFindings.push(`AV Stenosis (AS): ${asMatch[1]} - Requires quantitative assessment`);
          medicalCategories.push('aortic_stenosis', 'diagnostic_criteria');
        }
      }
      
      if (document.content.includes("SPI - Systolic Perf")) {
        cardiacFindings.push("SPI - Systolic Performance: Abnormal - Reduced heart muscle contractility");
        medicalCategories.push('cardiac_performance', 'diagnostic_criteria');
      }
      
      if (document.content.includes("MPI - Myocardial Perf")) {
        cardiacFindings.push("MPI - Myocardial Perfusion: Abnormal - Possible reduced blood flow to heart muscle");
        medicalCategories.push('myocardial_perfusion', 'diagnostic_criteria');
      }
      
      if (cardiacFindings.length > 0) {
        relevantDocumentSections.push(...cardiacFindings);
        relevantDocumentSections.push("CLINICAL SIGNIFICANCE: Multiple abnormal cardiac findings detected requiring medical evaluation and diagnostic recommendations.");
      }
    }

    // Special handling for medication queries - CRITICAL: Only search in patient document
    let medicationInfo = "";
    if (queryLower.includes("medication") || queryLower.includes("medicine") || queryLower.includes("drug") || queryLower.includes("prescription")) {
      // Search for actual medications in the document content
      const medicationPatterns = [
        /medication[s]?[:]*\s*([^.\n]+)/gi,
        /drug[s]?[:]*\s*([^.\n]+)/gi,
        /prescription[s]?[:]*\s*([^.\n]+)/gi,
        /taking[:]*\s*([^.\n]+)/gi,
        /prescribed[:]*\s*([^.\n]+)/gi,
        /current medications?[:]*\s*([^.\n]+)/gi
      ];
      
      const foundMedications = [];
      for (const pattern of medicationPatterns) {
        const matches = [...document.content.matchAll(pattern)];
        for (const match of matches) {
          if (match[1] && match[1].trim().length > 0 && !match[1].toLowerCase().includes('none') && !match[1].toLowerCase().includes('no ')) {
            foundMedications.push(match[1].trim());
          }
        }
      }
      
      if (foundMedications.length > 0) {
        medicationInfo = `MEDICATIONS FOUND IN PATIENT DOCUMENT: ${foundMedications.join(", ")}`;
      } else {
        medicationInfo = "IMPORTANT: No medications are mentioned in this patient's document. The patient is not currently taking any prescribed medications according to their medical record.";
      }
      
      relevantDocumentSections.push(medicationInfo);
        // DO NOT add treatment category to avoid suggesting medications from knowledge base
      // We only want to report what's actually in the patient's document
    }

    // Get relevant entities for the query
    let relevantEntities = {};
    if (document.entities) {
      for (const [category, entities] of Object.entries(document.entities)) {
        if (Array.isArray(entities)) {
          const matchingEntities = entities.filter(entity =>
            query.toLowerCase().includes(entity.toLowerCase())
          );

          if (matchingEntities.length > 0) {
            relevantEntities[category] = matchingEntities;
          }
        }
      }
    }    // Generate answer using Gemini with RAG-enhanced context
    const prompt = `You are a medical assistant helping a patient understand their medical documents. Your goal is to provide helpful, accurate information based on the patient's specific medical document content and established medical knowledge.

PATIENT'S DOCUMENT INFORMATION:
${relevantDocumentSections.length > 0 ? relevantDocumentSections.join('\n\n') : 'No specific patient data found related to the query.'}

${Object.keys(relevantEntities).length > 0 ? `
RELEVANT MEDICAL ENTITIES FROM PATIENT'S DOCUMENT:
${JSON.stringify(relevantEntities, null, 2)}
` : ''}

MEDICAL KNOWLEDGE BASE CONTEXT (for reference and interpretation ONLY):
${relevantKnowledge.length > 0 ? relevantKnowledge.map(knowledge => knowledge.content).join('\n\n') : 'No specific medical knowledge found for this query.'}

Document metadata:
- Document name: ${document.fileName}
- Upload date: ${document.uploadDate}

User question: ${query}

CRITICAL INSTRUCTIONS:
1. **PRIMARY FOCUS**: Answer based ONLY on the patient's specific document data shown above in "PATIENT'S DOCUMENT INFORMATION" section.
2. **REFERENCE VALUES vs PATIENT VALUES**: The "MEDICAL KNOWLEDGE BASE CONTEXT" contains reference ranges and medical guidelines - these are NOT the patient's actual values. NEVER present reference ranges as if they are the patient's test results.
3. **Diagnostic Recommendations**: When abnormal findings are present, provide specific diagnostic recommendations based on medical guidelines.
4. **Medication Queries**: For medication questions, ONLY report what is actually mentioned in the patient's document. DO NOT suggest medications from general medical knowledge.
5. **Accuracy**: NEVER make up or invent test values, medications, or findings that aren't in the patient's document.
6. **Exact Values**: When mentioning the patient's results, quote the EXACT values from their document only.
7. **Clinical Significance**: Use medical knowledge to explain the importance of the patient's actual findings.
8. **Clear Distinction**: Always clearly distinguish between "your test shows..." (patient data) and "normal ranges are..." (reference data).

SPECIAL HANDLING FOR ABNORMAL CARDIAC FINDINGS:
- If HFpEF score is elevated (≥4), explain the intermediate/high probability and recommend comprehensive evaluation
- If diastolic dysfunction is present, explain its significance and monitoring needs
- If multiple abnormal findings are present, emphasize the need for cardiology consultation
- Always provide specific, actionable recommendations based on current medical guidelines

MEDICATION QUERY HANDLING:
- If no medications are found in the document, clearly state this fact
- DO NOT suggest medications from medical knowledge - only report what's in the patient's document
- If medications are mentioned, list them exactly as they appear in the document

Instructions for formatting your response:
1. Use markdown formatting for readability
2. Use bullet points (•) for lists
3. Use numbered lists (1., 2., 3.) for steps and recommendations
4. Create tables for test results comparison when applicable
5. Use bold for important values and findings: **[value]**
6. Use headings to organize sections (## for main sections)
7. For abnormal values, create a "Clinical Significance" section
8. Include a "Recommended Next Steps" section for abnormal findings
9. Use clear, patient-friendly language while maintaining medical accuracy

Content Requirements:
1. Answer the patient's question based on THEIR specific document data
2. Use medical knowledge to provide context and interpretation
3. Explain medical terms in simple language
4. Be conversational and reassuring but medically accurate
5. For abnormal findings, provide specific, actionable recommendations
6. Focus on what the patient's specific results mean for their health
7. Include relevant risk factors and clinical significance when applicable`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.status(200).json({
      answer: answer,
      sources: [
        ...relevantKnowledge.map((knowledge, index) => ({
          id: `knowledge_${index}`,
          excerpt: knowledge.content.substring(0, 200) + "...",
          source: knowledge.source,
          category: knowledge.category,
          type: 'medical_knowledge'
        })),
        ...relevantDocumentSections.slice(0, 3).map((section, index) => ({
          id: `patient_doc_${index}`,
          excerpt: section.substring(0, 200) + "...",
          source: document.fileName,
          type: 'patient_document'
        }))
      ],
    });
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

// Route to get all documents
app.get("/api/documents", async (req, res) => {
  try {
    const documents = await db.collection("documents")
      .find({})
      .project({ fileName: 1, uploadDate: 1 })
      .sort({ uploadDate: -1 })
      .toArray();

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Serve the frontend app for any non-API routes (in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const frontendPath = path.join(__dirname, '../frontend/dist/index.html');
    
    // Check if the frontend build exists
    if (fs.existsSync(frontendPath)) {
      res.sendFile(frontendPath);
    } else {
      // If frontend build doesn't exist, send a simple message
      res.status(503).send(`
        <html>
          <head><title>MedBook - Building</title></head>
          <body>
            <h1>MedBook Application</h1>
            <p>The frontend is currently being built. Please try again in a few moments.</p>
            <p>API endpoints are available at /api/*</p>
          </body>
        </html>
      `);
    }
  });
}

// Start the server
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`RAG backend server running on port ${PORT}`);
  });
});

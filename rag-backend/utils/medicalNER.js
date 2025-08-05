const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Cache for the NER model to avoid reloading
let nerModelCache = null;
let pipelineFunction = null;

/**
 * Get the pipeline function from @xenova/transformers
 */
async function getPipelineFunction() {
  if (!pipelineFunction) {
    const { pipeline } = await import('@xenova/transformers');
    pipelineFunction = pipeline;
  }
  return pipelineFunction;
}

/**
 * Get the NER model, loading it if necessary
 * We're using a general NER model that's publicly accessible
 */
async function getNERModel() {
  if (!nerModelCache) {
    try {
      // Use a more accessible model that's publicly available
      console.log('Loading NER model: Xenova/bert-base-NER');
      const pipeline = await getPipelineFunction();
      nerModelCache = await pipeline('token-classification', 'Xenova/bert-base-NER');
      return nerModelCache;
    } catch (error) {
      console.error('Error loading NER model:', error);
      // If that fails too, we'll rely on Gemini for entity extraction
      console.log('Error loading NER model, will use Gemini for entity extraction');
      return null;
    }
  }
  return nerModelCache;
}

/**
 * Extract medical entities using the local NER model
 * @param {string} text - The text to analyze
 * @returns {Promise<Array>} - Array of extracted entities
 */
async function extractMedicalEntitiesLocal(text) {
  try {
    const model = await getNERModel();

    // If model is null, fallback to Gemini
    if (!model) {
      console.log('No local NER model available, using Gemini for entity extraction');
      return extractMedicalEntitiesWithGemini(text);
    }

    // Process text in chunks if it's too long
    const maxChunkSize = 512; // Typical limit for transformer models
    const chunks = [];

    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.substring(i, i + maxChunkSize));
    }

    // Process each chunk and combine results
    const allEntities = [];
    for (const chunk of chunks) {
      const entities = await model(chunk);
      allEntities.push(...entities);
    }

    // Group entities by type
    const groupedEntities = {};

    for (const entity of allEntities) {
      const type = entity.entity_group;
      const word = entity.word;

      if (!groupedEntities[type]) {
        groupedEntities[type] = new Set();
      }

      groupedEntities[type].add(word);
    }

    // Convert sets to arrays
    const result = {};
    for (const [type, entities] of Object.entries(groupedEntities)) {
      result[type] = Array.from(entities);
    }

    // Map general NER types to medical categories
    const medicalMapping = {
      'PER': 'person',
      'ORG': 'organization',
      'LOC': 'location',
      'MISC': 'medical_term'
    };

    // Create a more medically-focused result
    const medicalResult = {};
    for (const [type, entities] of Object.entries(result)) {
      const medicalType = medicalMapping[type] || type.toLowerCase();
      medicalResult[medicalType] = entities;
    }

    return medicalResult;
  } catch (error) {
    console.error('Error extracting medical entities locally:', error);
    // Fallback to Gemini if local extraction fails
    return extractMedicalEntitiesWithGemini(text);
  }
}

/**
 * Extract medical entities using Google Gemini
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} - Object with categorized medical entities
 */
async function extractMedicalEntitiesWithGemini(text) {
  try {
    // Truncate text if it's too long for the API
    const maxLength = 30000;
    const truncatedText = text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;

    const prompt = `Extract comprehensive medical entities from the following text and categorize them. Focus on cardiovascular medicine and return entities in these categories:

Categories to extract:
1. cardiovascular_diseases (CAD, heart failure, arrhythmias, valvular disease, cardiomyopathy, etc.)
2. cardiovascular_medications (beta-blockers, ACE inhibitors, statins, anticoagulants, etc.)
3. cardiac_procedures (PCI, CABG, catheterization, echocardiography, stress test, etc.)
4. cardiac_lab_tests (troponin, BNP, CK-MB, lipid panel, etc.)
5. cardiovascular_anatomy (left ventricle, aorta, coronary arteries, mitral valve, etc.)
6. vital_signs (blood pressure, heart rate, pulse, etc.)
7. cardiac_symptoms (chest pain, shortness of breath, palpitations, syncope, etc.)
8. risk_factors (diabetes, hypertension, smoking, obesity, family history, etc.)
9. cardiac_devices (pacemaker, ICD, stent, valve prosthesis, etc.)
10. hemodynamic_parameters (ejection fraction, cardiac output, pressures, etc.)
11. imaging_findings (ST elevation, wall motion abnormalities, stenosis, regurgitation, etc.)
12. electrophysiology (atrial fibrillation, ventricular tachycardia, heart block, etc.)

Text: ${truncatedText}

Output format:
{
  "cardiovascular_diseases": ["entity1", "entity2"],
  "cardiovascular_medications": ["entity1", "entity2"],
  "cardiac_procedures": ["entity1", "entity2"],
  "cardiac_lab_tests": ["entity1", "entity2"],
  "cardiovascular_anatomy": ["entity1", "entity2"],
  "vital_signs": ["entity1", "entity2"],
  "cardiac_symptoms": ["entity1", "entity2"],
  "risk_factors": ["entity1", "entity2"],
  "cardiac_devices": ["entity1", "entity2"],
  "hemodynamic_parameters": ["entity1", "entity2"],
  "imaging_findings": ["entity1", "entity2"],
  "electrophysiology": ["entity1", "entity2"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Error parsing JSON from response:", parseError);
        return { error: "Failed to parse entities" };
      }
    } else {
      return { error: "No entities found" };
    }
  } catch (error) {
    console.error("Error extracting medical entities with Gemini:", error);
    return { error: "Failed to extract medical entities" };
  }
}

/**
 * Extract medical entities using both local model and Gemini, then combine results
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} - Object with categorized medical entities
 */
async function extractMedicalEntities(text) {
  try {
    // Try local extraction first
    const localEntities = await extractMedicalEntitiesLocal(text);

    // If local extraction failed or returned minimal results, use Gemini
    if (localEntities.error || Object.keys(localEntities).length < 2) {
      return extractMedicalEntitiesWithGemini(text);
    }

    // Otherwise, use local results
    return localEntities;
  } catch (error) {
    console.error('Error in extractMedicalEntities:', error);
    // Fallback to Gemini
    return extractMedicalEntitiesWithGemini(text);
  }
}

/**
 * Create a simple medical knowledge graph from extracted entities
 * @param {Object} entities - Object with categorized medical entities
 * @returns {Object} - A simple knowledge graph structure
 */
function createMedicalKnowledgeGraph(entities) {
  const graph = {
    nodes: [],
    edges: []
  };

  // Add nodes for each entity
  let nodeId = 0;
  const nodeMap = {};

  for (const [category, items] of Object.entries(entities)) {
    if (Array.isArray(items)) {
      for (const item of items) {
        const id = nodeId++;
        graph.nodes.push({
          id,
          label: item,
          type: category
        });
        nodeMap[`${category}:${item}`] = id;
      }
    }
  }

  // Add edges based on medical knowledge
  // This is a simplified approach - in a production system, you would use
  // a medical ontology or knowledge base to create more meaningful connections

  // Connect diseases to related medications
  if (entities.diseases && entities.medications) {
    for (const disease of entities.diseases) {
      for (const medication of entities.medications) {
        // Use Gemini to check if there's a relationship
        // This would be done asynchronously in a real system
        graph.edges.push({
          source: nodeMap[`diseases:${disease}`],
          target: nodeMap[`medications:${medication}`],
          label: 'may_treat'
        });
      }
    }
  }

  // Connect lab tests to diseases
  if (entities.lab_tests && entities.diseases) {
    for (const test of entities.lab_tests) {
      for (const disease of entities.diseases) {
        graph.edges.push({
          source: nodeMap[`lab_tests:${test}`],
          target: nodeMap[`diseases:${disease}`],
          label: 'may_diagnose'
        });
      }
    }
  }

  return graph;
}

module.exports = {
  extractMedicalEntities,
  createMedicalKnowledgeGraph
};

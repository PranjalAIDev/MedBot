const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { fromPath } = require("pdf2pic"); // For PDF-to-image conversion
const tesseract = require("tesseract.js"); // For OCR of images
const pdfParse = require("pdf-parse"); // For parsing PDF content
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb"); // Include ObjectId for querying by ID
const path = require("path");

require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());

// Configure Multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(
        new Error("Unsupported file type. Only PDFs and images are allowed."),
        false
      );
    }
  },
});

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// MongoDB connection URI and database setup
const mongoUri = process.env.MONGO_URI;
const dbName = "medBook";
let db;

MongoClient.connect(mongoUri)
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(dbName);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

// Helper function to extract JSON from text
const extractJSON = (text) => {
  try {
    if (typeof text !== "string") {
      throw new TypeError("Input is not a string");
    }

    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse JSON:", error.message);
    throw new Error("Failed to parse structured JSON from Gemini API response");
  }
};

// Function to extract text from PDFs using OCR
const extractTextFromPdfUsingOCR = async (filePath) => {
  try {
    console.log("Converting PDF pages to images...");
    const options = {
      density: 300, // Image resolution
      saveFilename: "temp", // Temporary file prefix
      savePath: "./uploads/", // Save images in the uploads directory
      format: "png",
      width: 1024,
      height: 768,
    };

    const pdf2pic = fromPath(filePath, options);
    const totalPages = await pdf2pic.info();
    console.log(`PDF has ${totalPages} page(s).`);

    let extractedText = "";
    for (let i = 1; i <= totalPages; i++) {
      console.log(`Processing page ${i}/${totalPages}...`);
      const result = await pdf2pic.convert(i); // Convert each page to an image
      const { data } = await tesseract.recognize(result.path, "eng");
      extractedText += data.text + "\n";
    }

    return extractedText.trim();
  } catch (error) {
    console.error("Error during OCR conversion:", error.message);
    throw new Error("Failed to process PDF with OCR.");
  }
};

// Route to handle file uploads
app.post("/upload", upload.single("medicalReport"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    console.log(`File uploaded: ${file.originalname}`);
    let extractedText = "";

    // Determine a permanent path for the uploaded file
    const permanentPath = path.join(__dirname, "uploads", file.originalname);
    fs.renameSync(file.path, permanentPath); // Move file to the permanent location

    // Extract text from the uploaded file
    if (file.mimetype === "application/pdf") {
      try {
        const pdfData = fs.readFileSync(permanentPath);
        const pdfContent = await pdfParse(pdfData);
        extractedText = pdfContent.text;

        if (!extractedText.trim()) {
          console.warn("PDF contains no text. Attempting OCR...");
          extractedText = await extractTextFromPdfUsingOCR(permanentPath);
        }
      } catch (error) {
        console.error("PDF parsing failed. Attempting OCR...");
        extractedText = await extractTextFromPdfUsingOCR(permanentPath);
      }
    } else if (file.mimetype.startsWith("image/")) {
      const { data } = await tesseract.recognize(permanentPath, "eng");
      extractedText = data.text;
    } else {
      return res.status(400).send("Unsupported file type.");
    }

    console.log("Extracted Text:", extractedText);

    // Send the extracted text to Google Gemini
    const prompt = `Organize the following medical report into structured JSON format:\n\n${extractedText}`;
    const result = await model.generateContent(prompt);

    console.log("Gemini API Full Response:", result);

    let structuredData = null;
    if (
      result.response &&
      result.response.candidates &&
      result.response.candidates.length > 0
    ) {
      const structuredText =
        result.response.candidates[0].content.parts?.[0]?.text ||
        result.response.candidates[0].content;

      try {
        structuredData = extractJSON(structuredText);
      } catch (parseError) {
        console.error("Structured Text Parsing Error:", parseError.message);
        structuredData = {
          rawResponse: structuredText,
        };
      }
    } else {
      throw new Error("No valid response from Gemini API");
    }

    console.log("Structured Data:", structuredData);

    const collection = db.collection("medicalReports");
    const insertResult = await collection.insertOne({
      ...structuredData,
      fileName: file.originalname,
      filePath: permanentPath, // Save the permanent path
      uploadDate: new Date(),
    });

    console.log("Data inserted into MongoDB:", insertResult.insertedId);

    res.status(200).json({
      message: "File processed, structured, and stored successfully.",
      data: structuredData,
      mongoId: insertResult.insertedId,
    });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).send("Internal Server Error.");
  }
});

// Route to fetch metrics
app.get("/api/metrics", async (req, res) => {
  try {
    const collection = db.collection("medicalReports");

    // Fetch documents that contain the required fields
    const reports = await collection
      .find({
        "report.testDate": { $exists: true },
        "report.results.fastingGlucose.value": { $exists: true },
        "report.results.postPrandialGlucose.value": { $exists: true },
        "report.results.hba1c.value": { $exists: true },
      })
      .toArray();

    // Extract the relevant data
    const timestamps = reports.map((report) => report.report.testDate);
    const fastingGlucose = reports.map(
      (report) => report.report.results.fastingGlucose.value
    );
    const postPrandialGlucose = reports.map(
      (report) => report.report.results.postPrandialGlucose.value
    );
    const hba1c = reports.map((report) => report.report.results.hba1c.value);

    res.status(200).json({
      timestamps,
      metrics: { fastingGlucose, postPrandialGlucose, hba1c },
    });
  } catch (error) {
    console.error("Error fetching metrics:", error.message);
    res.status(500).send("Failed to fetch metrics.");
  }
});

// Route to fetch uploaded reports
app.get("/api/uploads", async (req, res) => {
  try {
    const collection = db.collection("medicalReports");
    const uploads = await collection
      .find({})
      .sort({ uploadDate: -1 })
      .toArray();
    res.status(200).json(uploads);
  } catch (error) {
    console.error("Error fetching uploads:", error.message);
    res.status(500).send("Failed to fetch uploads.");
  }
});

// Route to download a file by ID
app.get("/api/download/:id", async (req, res) => {
  try {
    const collection = db.collection("medicalReports");
    const fileData = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!fileData) {
      return res.status(404).send("File not found in the database.");
    }

    const filePath = path.resolve(fileData.filePath); // Resolve the full path
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File does not exist on the server.");
    }

    res.download(filePath, fileData.fileName);
  } catch (error) {
    console.error("Error downloading file:", error.message);
    res.status(500).send("Failed to download file.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

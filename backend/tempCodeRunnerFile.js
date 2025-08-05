const express = require("express");
const multer = require("multer");
const fs = require("fs");
const tesseract = require("tesseract.js"); // For OCR of images
const pdfParse = require("pdf-parse"); // For parsing PDF content
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const app = express();
const port = 3000;

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
const mongoUri = process.env.MONGO_URI; // Example: "mongodb://localhost:27017"
const dbName = "medBook"; // Your database name
let db;

MongoClient.connect(mongoUri, { useUnifiedTopology: true })
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

    // Log the raw text for debugging purposes
    console.log("Raw Structured Text:", text);

    // Remove code block markers and trim whitespace
    const cleanText = text.replace(/```json|```/g, "").trim();

    // Parse and return the JSON
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse JSON:", error.message);
    throw new Error("Failed to parse structured JSON from Gemini API response");
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

    // Extract text from the uploaded file
    if (file.mimetype === "application/pdf") {
      const pdfData = fs.readFileSync(file.path);
      const pdfContent = await pdfParse(pdfData);
      extractedText = pdfContent.text;
    } else if (file.mimetype.startsWith("image/")) {
      const { data } = await tesseract.recognize(file.path, "eng");
      extractedText = data.text;
    } else {
      return res.status(400).send("Unsupported file type.");
    }

    console.log("Extracted Text:", extractedText);

    // Send the extracted text to Google Gemini
    const prompt = `Organize the following medical report into structured JSON format:\n\n${extractedText}`;
    const result = await model.generateContent(prompt);

    console.log("Gemini API Full Response:", result);

    // Extract and clean the structured text from the Gemini API response
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

    // Insert the structured data into MongoDB
    const collection = db.collection("medicalReports");
    const insertResult = await collection.insertOne(structuredData);

    console.log("Data inserted into MongoDB:", insertResult.insertedId);

    // Respond with the cleaned and structured data
    res.status(200).json({
      message: "File processed, structured, and stored successfully.",
      data: structuredData,
      mongoId: insertResult.insertedId,
    });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).send("Internal Server Error.");
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

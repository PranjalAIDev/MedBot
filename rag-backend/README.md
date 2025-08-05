# MedBook RAG Backend

This is a Retrieval-Augmented Generation (RAG) backend service for the MedBook application. It allows users to upload medical PDF documents, extract information from them, and ask questions about the content.

## Features

- PDF text extraction
- Medical entity recognition
- Document storage and retrieval
- Question answering based on document content

## Architecture

The RAG application follows this flow:

1. **Medical PDF Reports**: Users upload medical PDF documents
2. **Text Extraction**: The system extracts text from PDFs using pdf-parse
3. **Medical Entity Recognition**: The system identifies medical entities using Google Gemini
4. **Knowledge Base**: Extracted text and entities are stored in MongoDB
5. **User Query**: Users ask questions about their medical documents
6. **Information Retrieval**: The system retrieves relevant information from the documents
7. **Question Answering**: Google Gemini generates answers based on the retrieved information
8. **User Response**: The system returns the answer to the user with source citations

## API Endpoints

- `POST /api/upload`: Upload and process a PDF document
- `POST /api/query`: Query a document with a natural language question
- `GET /api/documents`: Get a list of all uploaded documents

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Start the server:
   ```
   npm start
   ```

## Integration with Frontend

The RAG backend integrates with the Chat4Health component in the MedBook frontend. Users can:

1. Upload medical PDF documents
2. Select from previously uploaded documents
3. Ask questions about the documents
4. View answers with source citations

## Technologies Used

- Express.js: Web server framework
- MongoDB: Document storage
- pdf-parse: PDF text extraction
- Google Gemini: Medical entity recognition and question answering
- Multer: File upload handling

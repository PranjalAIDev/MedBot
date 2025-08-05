const { MongoClient } = require('mongodb');
require('dotenv').config();

// Initialize MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "medBookRAG";

// Use a publicly accessible embedding model
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'; // This is a general-purpose model that's publicly available
// For production, consider using medical-specific models like:
// - 'pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb'
// - 'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext'

// Cache for the embedding model to avoid reloading
let embeddingModelCache = null;
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
 * Get the embedding model, loading it if necessary
 */
async function getEmbeddingModel() {
  if (!embeddingModelCache) {
    console.log(`Loading embedding model: ${EMBEDDING_MODEL}`);
    const pipeline = await getPipelineFunction();
    embeddingModelCache = await pipeline('feature-extraction', EMBEDDING_MODEL);
  }
  return embeddingModelCache;
}

/**
 * Generate embeddings for a text
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
async function generateEmbedding(text) {
  try {
    const model = await getEmbeddingModel();
    const result = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store document chunks with embeddings in MongoDB
 * @param {Object} document - The document object
 * @param {Array} chunks - Array of text chunks
 * @param {string} documentId - MongoDB document ID
 */
async function storeChunksWithEmbeddings(document, chunks, documentId) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const vectorCollection = db.collection('vectors');

    // Create a vector index if it doesn't exist
    const collections = await db.listCollections({ name: 'vectors' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('vectors');
      // Note: In a production environment with MongoDB Atlas, you would create a vector search index
      // This is a simplified version for local development
    }

    // Process chunks and generate embeddings
    const chunkDocuments = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await generateEmbedding(chunk.content);
        return {
          documentId: documentId,
          chunkId: index,
          content: chunk.content,
          embedding: embedding,
          metadata: {
            fileName: document.fileName,
            uploadDate: document.uploadDate
          }
        };
      })
    );

    // Store chunks with embeddings
    if (chunkDocuments.length > 0) {
      await vectorCollection.insertMany(chunkDocuments);
      console.log(`Stored ${chunkDocuments.length} chunks with embeddings`);
    }

  } catch (error) {
    console.error('Error storing chunks with embeddings:', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Find relevant chunks for a query using vector similarity
 * @param {string} query - The user query
 * @param {string} documentId - Optional document ID to restrict search
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of relevant chunks
 */
async function findRelevantChunks(query, documentId = null, limit = 5) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const vectorCollection = db.collection('vectors');

    // Check if the vectors collection exists and has documents
    const vectorCount = await vectorCollection.countDocuments();
    if (vectorCount === 0) {
      console.log('No vectors found in database, returning empty array');
      return [];
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);

      // Build the search filter
      const filter = documentId ? { documentId: documentId } : {};

      // In a production environment with MongoDB Atlas, you would use $vectorSearch
      // For local development, we'll retrieve all chunks and compute similarity in memory
      const allChunks = await vectorCollection.find(filter).toArray();

      if (allChunks.length === 0) {
        console.log('No chunks found for the document');
        return [];
      }

      // Compute cosine similarity for each chunk
      const chunksWithSimilarity = allChunks.map(chunk => {
        try {
          const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
          return { ...chunk, similarity };
        } catch (error) {
          console.error('Error computing similarity for chunk:', error);
          return { ...chunk, similarity: 0 };
        }
      });

      // Sort by similarity (highest first) and take the top results
      const relevantChunks = chunksWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return relevantChunks;
    } catch (embeddingError) {
      console.error('Error generating query embedding:', embeddingError);
      return [];
    }
  } catch (error) {
    console.error('Error finding relevant chunks:', error);
    return []; // Return empty array instead of throwing error
  } finally {
    await client.close();
  }
}

/**
 * Compute cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Cosine similarity (-1 to 1)
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

module.exports = {
  generateEmbedding,
  storeChunksWithEmbeddings,
  findRelevantChunks
};

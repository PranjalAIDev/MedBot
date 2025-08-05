const { MongoClient } = require('mongodb');
const { generateEmbedding } = require('./embeddings');
const { chunkText } = require('./textProcessing');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "medBookRAG";

/**
 * Store external medical knowledge in the knowledge base
 * This is separate from patient documents
 */
async function storeKnowledgeBaseChunks(knowledgeContent, source, category) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const knowledgeCollection = db.collection('knowledge_base');

    // Create index if it doesn't exist
    const collections = await db.listCollections({ name: 'knowledge_base' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('knowledge_base');
      await knowledgeCollection.createIndex({ "embedding": "2dsphere" });
      await knowledgeCollection.createIndex({ "category": 1 });
      await knowledgeCollection.createIndex({ "source": 1 });
    }

    // Chunk the knowledge content
    const chunks = chunkText(knowledgeContent, 1000, 200);

    // Process chunks and generate embeddings
    const knowledgeDocuments = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await generateEmbedding(chunk.content);
        return {
          content: chunk.content,
          embedding: embedding,
          source: source,
          category: category,
          chunkIndex: index,
          createdAt: new Date()
        };
      })
    );

    // Store knowledge chunks with embeddings
    if (knowledgeDocuments.length > 0) {
      await knowledgeCollection.insertMany(knowledgeDocuments);
      console.log(`Stored ${knowledgeDocuments.length} knowledge base chunks from ${source}`);
    }

  } catch (error) {
    console.error('Error storing knowledge base chunks:', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Find relevant knowledge from the knowledge base for a query
 * This searches external medical knowledge, not patient documents
 */
async function findRelevantKnowledge(query, categories = null, limit = 5) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const knowledgeCollection = db.collection('knowledge_base');

    // Check if knowledge base exists and has documents
    const knowledgeCount = await knowledgeCollection.countDocuments();
    if (knowledgeCount === 0) {
      console.log('No knowledge base found, please populate it first');
      return [];
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);

      // Build the search filter
      const filter = {};
      if (categories && categories.length > 0) {
        filter.category = { $in: categories };
      }

      // Retrieve all knowledge chunks and compute similarity
      const allKnowledge = await knowledgeCollection.find(filter).toArray();

      if (allKnowledge.length === 0) {
        console.log('No knowledge found for the specified categories');
        return [];
      }

      // Compute cosine similarity for each knowledge chunk
      const knowledgeWithSimilarity = allKnowledge.map(knowledge => {
        try {
          const similarity = cosineSimilarity(queryEmbedding, knowledge.embedding);
          return { ...knowledge, similarity };
        } catch (error) {
          console.error('Error computing similarity for knowledge:', error);
          return { ...knowledge, similarity: 0 };
        }
      });

      // Sort by similarity (highest first) and take the top results
      const relevantKnowledge = knowledgeWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return relevantKnowledge;
    } catch (embeddingError) {
      console.error('Error generating query embedding:', embeddingError);
      return [];
    }
  } catch (error) {
    console.error('Error finding relevant knowledge:', error);
    return [];
  } finally {
    await client.close();
  }
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + (a * vecB[i]), 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + (a * a), 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + (b * b), 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = {
  storeKnowledgeBaseChunks,
  findRelevantKnowledge
};

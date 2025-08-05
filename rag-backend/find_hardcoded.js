const { MongoClient } = require('mongodb');

const mongoUri = 'mongodb+srv://yashbudhia:khuljas1ms1m@cluster0.nnafmtq.mongodb.net/medBookRAG';

async function findHardcodedValues() {
  const client = new MongoClient(mongoUri);
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully');
    const db = client.db('medBookRAG');
    
    console.log('=== SEARCHING FOR SPECIFIC HARDCODED VALUES ===');
    
    // Search for the exact problematic values
    const problemValues = [
      '>0.04 ng/mL',
      '>0.014 ng/mL', 
      '>6.3 ng/mL',
      'diagnostic for MI',
      'Troponin I: >0.04',
      'Troponin T: >0.014',
      'CK-MB: >6.3',
      'CK-MB: >5% of total CK',
      'Myoglobin: Early marker'
    ];
    
    let totalFound = 0;
    
    for (const value of problemValues) {
      console.log(`\nSearching for: '${value}'`);
      const docs = await db.collection('knowledge_base').find({
        content: { $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
      }).toArray();
      
      if (docs.length > 0) {
        totalFound += docs.length;
        console.log(`*** FOUND ${docs.length} documents with '${value}' ***`);
        docs.forEach((doc, i) => {
          console.log(`Doc ${i+1} ID: ${doc._id}`);
          console.log(`Category: ${doc.category}`);
          const index = doc.content.toLowerCase().indexOf(value.toLowerCase());
          const start = Math.max(0, index - 50);
          const end = Math.min(doc.content.length, index + value.length + 50);
          console.log(`Context: ...${doc.content.substring(start, end)}...`);
        });
      }
    }
    
    console.log(`\n=== TOTAL HARDCODED DOCUMENTS FOUND: ${totalFound} ===`);
    
    // Also check for documents that might contain cardiac biomarker diagnostic criteria
    console.log('\n=== SEARCHING FOR CARDIAC DIAGNOSTIC CRITERIA ===');
    const cardiacDiagnostic = await db.collection('knowledge_base').find({
      $and: [
        { content: { $regex: 'troponin', $options: 'i' } },
        { content: { $regex: 'ng/mL', $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`Found ${cardiacDiagnostic.length} documents with cardiac diagnostic criteria`);
    cardiacDiagnostic.forEach((doc, i) => {
      console.log(`\nCardiac Doc ${i+1}:`);
      console.log(`ID: ${doc._id}`);
      console.log(`Category: ${doc.category}`);
      console.log(`Content preview: ${doc.content.substring(0, 200)}...`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

findHardcodedValues();

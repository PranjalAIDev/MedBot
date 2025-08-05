const { MongoClient } = require('mongodb');

async function checkCHARTStatus() {
  const client = new MongoClient('mongodb+srv://yashbudhia:khuljas1ms1m@cluster0.nnafmtq.mongodb.net/');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('medBookRAG');
    
    // Find CHART document
    const document = await db.collection('documents').findOne({fileName: /CHART/});
    
    if (document) {
      console.log('\n📋 CHART Document Details:');
      console.log('- ID:', document._id);
      console.log('- Filename:', document.fileName);
      console.log('- Upload Date:', document.uploadDate);
      console.log('- Content Length:', document.content ? document.content.length : 'No content');
      console.log('- Number of Chunks:', document.chunks ? document.chunks.length : 0);
      
      // Check for BMI data
      if (document.content && document.content.includes('BMI')) {
        const bmiLines = document.content.split('\n').filter(line => line.toLowerCase().includes('bmi'));
        console.log('- BMI data found:', bmiLines.length > 0 ? '✅ YES' : '❌ NO');
        if (bmiLines.length > 0) {
          console.log('- BMI lines:', bmiLines.slice(0, 3)); // Show first 3 BMI lines
        }
      }
      
      // Check vectors for this document
      const vectorCount = await db.collection('vectors').countDocuments({documentId: document._id.toString()});
      console.log('- Vector Count:', vectorCount);
      
      if (vectorCount === 0) {
        console.log('\n❌ CRITICAL ISSUE: CHART document has NO VECTORS!');
        console.log('This means BMI queries will fail because vector similarity search finds nothing.');
        console.log('\n🔧 Solution: Create vectors for the CHART document chunks');
        
        return { document, hasVectors: false };
      } else {
        console.log('\n✅ Vectors found for CHART document');
        return { document, hasVectors: true };
      }
    } else {
      console.log('❌ CHART document not found in database');
      return null;
    }
    
  } catch (error) {
    console.error('Error checking CHART status:', error);
    return null;
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  checkCHARTStatus();
}

module.exports = { checkCHARTStatus };

const axios = require('axios');

const RAG_BASE_URL = 'http://localhost:5001';

// Test queries for cardiovascular medicine
const testQueries = [
  {
    name: "Cardiac Biomarkers Query",
    query: "What are the normal ranges for cardiac biomarkers like troponin and BNP?"
  },
  {
    name: "Heart Failure Treatment",
    query: "What are the treatment options for heart failure?"
  },
  {
    name: "Cholesterol Levels",
    query: "What are the target cholesterol levels for cardiovascular risk prevention?"
  },
  {
    name: "Myocardial Infarction Diagnosis",
    query: "How is a heart attack diagnosed using laboratory tests?"
  },
  {
    name: "ACE Inhibitors",
    query: "What are ACE inhibitors and how do they work for heart conditions?"
  },
  {
    name: "Electrocardiogram Interpretation",
    query: "What does an abnormal ECG indicate about heart health?"
  }
];

async function testRAGSystem() {
  console.log('🚀 Testing Enhanced Cardiovascular RAG System\n');
  
  try {
    // Test server connectivity
    const healthCheck = await axios.get(`${RAG_BASE_URL}/api/documents`);
    console.log('✅ Server is running and accessible');
    console.log(`📊 Found ${healthCheck.data.length} documents in the system\n`);
    
    // Run test queries
    for (let i = 0; i < testQueries.length; i++) {
      const test = testQueries[i];
      console.log(`📋 Test ${i + 1}: ${test.name}`);
      console.log(`❓ Query: "${test.query}"\n`);
        try {
        console.log('🔍 Sending query to RAG system...');
        const response = await axios.post(`${RAG_BASE_URL}/api/query`, {
          query: test.query
        });
        
        console.log('📨 Response status:', response.status);
        
        if (response.data && response.data.answer) {
          console.log('✅ Response received:');
          console.log(`📄 Answer: ${response.data.answer.substring(0, 300)}...`);
          
          if (response.data.sources && response.data.sources.length > 0) {
            console.log(`📚 Sources found: ${response.data.sources.length}`);
            response.data.sources.forEach((source, idx) => {
              if (source.type === 'medical_knowledge') {
                console.log(`   ${idx + 1}. ${source.category} - ${source.source}`);
              }
            });
          }
          
          console.log('\n' + '─'.repeat(80) + '\n');        } else {
          console.log('❌ No valid response received');
          console.log('Raw response:', JSON.stringify(response.data, null, 2));
          console.log('');
        }
        
      } catch (queryError) {
        console.log('❌ Error testing query:', queryError.message);
        if (queryError.response && queryError.response.data) {
          console.log('Error details:', queryError.response.data);
        }
        console.log('\n');
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to RAG server:', error.message);
    console.log('Make sure the RAG backend is running on port 5001');
  }
}

// Run the test
testRAGSystem().catch(console.error);

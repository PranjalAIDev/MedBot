/**
 * Test script to verify that the RAG system correctly distinguishes 
 * between patient data and medical reference ranges
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const SERVER_URL = 'http://localhost:5001';

async function testReferenceRangesFix() {
  console.log('🧪 Testing RAG system fix for reference ranges vs patient data...\n');

  try {
    // Test 1: Upload a sample document and query about abnormal values
    console.log('1. Testing query about abnormal cardiac values...');
    
    const testQuery = "What abnormal cardiac biomarker values do I have?";
    
    // First, let's check if there are any existing documents
    const documentsResponse = await axios.get(`${SERVER_URL}/api/documents`);
    
    if (documentsResponse.data.documents && documentsResponse.data.documents.length > 0) {
      const document = documentsResponse.data.documents[0];
      console.log(`Using existing document: ${document.fileName}`);
      
      // Query the document
      const queryResponse = await axios.post(`${SERVER_URL}/api/query/${document._id}`, {
        query: testQuery
      });
      
      console.log('\n📋 Query Response:');
      console.log('Question:', testQuery);
      console.log('\n🤖 AI Answer:');
      console.log(queryResponse.data.answer);
      
      console.log('\n📚 Sources Used:');
      queryResponse.data.sources.forEach((source, index) => {
        console.log(`${index + 1}. Type: ${source.type}, Source: ${source.source}`);
        console.log(`   Excerpt: ${source.excerpt}`);
      });
      
      // Check for the problematic hardcoded values
      const answer = queryResponse.data.answer.toLowerCase();
      const hasHardcodedTroponinI = answer.includes('troponin i >0.04 ng/ml') || answer.includes('troponin i: >0.04');
      const hasHardcodedTroponinT = answer.includes('troponin t >0.014 ng/ml') || answer.includes('troponin t: >0.014');
      const hasHardcodedCKMB = answer.includes('ck-mb >6.3 ng/ml') || answer.includes('ck-mb: >6.3');
      
      console.log('\n🔍 Fix Verification:');
      console.log(`❌ Contains hardcoded Troponin I threshold (>0.04): ${hasHardcodedTroponinI}`);
      console.log(`❌ Contains hardcoded Troponin T threshold (>0.014): ${hasHardcodedTroponinT}`);
      console.log(`❌ Contains hardcoded CK-MB threshold (>6.3): ${hasHardcodedCKMB}`);
      
      if (!hasHardcodedTroponinI && !hasHardcodedTroponinT && !hasHardcodedCKMB) {
        console.log('\n✅ SUCCESS: System correctly distinguishes reference ranges from patient data!');
      } else {
        console.log('\n❌ ISSUE: System still presenting reference ranges as patient values');
      }
      
      // Test 2: Query about specific patient values
      console.log('\n\n2. Testing query about specific patient test results...');
      
      const specificQuery = "What are my actual test results?";
      const specificResponse = await axios.post(`${SERVER_URL}/api/query/${document._id}`, {
        query: specificQuery
      });
      
      console.log('\n📋 Specific Query Response:');
      console.log('Question:', specificQuery);
      console.log('\n🤖 AI Answer:');
      console.log(specificResponse.data.answer);
      
    } else {
      console.log('❌ No documents found. Please upload a medical document first.');
      console.log('You can test by:');
      console.log('1. Opening the frontend application');
      console.log('2. Uploading a medical document');
      console.log('3. Running this test again');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testReferenceRangesFix();

// const fetch = require('node-fetch');

async function testBackend() {
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('Health endpoint response:', healthData);
    
    if (healthData.ok) {
      console.log('✅ Backend health check passed');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
    
    console.log('Backend is working correctly!');
  } catch (error) {
    console.error('Error testing backend:', error.message);
  }
}

testBackend();
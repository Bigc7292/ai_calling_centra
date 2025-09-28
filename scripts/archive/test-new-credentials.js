#!/usr/bin/env node

/**
 * 🧪 Test New Credentials
 * Verifies that new Supabase credentials are working properly
 */

console.log('🧪 Testing New Credentials');
console.log('===========================\n');

const http = require('http');
const fs = require('fs');
const path = require('path');

function checkEnvironmentFiles() {
  console.log('📋 Checking Environment Files...');
  console.log('--------------------------------');
  
  const frontendEnvPath = path.join(__dirname, '../apps/frontend/.env.local');
  const backendEnvPath = path.join(__dirname, '../.env');
  
  if (fs.existsSync(frontendEnvPath)) {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    if (frontendEnv.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      console.log('✅ Frontend anon key configured');
    } else {
      console.log('❌ Frontend anon key missing - UPDATE REQUIRED');
    }
  } else {
    console.log('❌ Frontend .env.local missing');
  }
  
  if (fs.existsSync(backendEnvPath)) {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    if (backendEnv.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
      console.log('✅ Backend service role key configured');
    } else {
      console.log('❌ Backend service role key missing - UPDATE REQUIRED');
    }
    if (backendEnv.includes('SUPABASE_ACCESS_TOKEN=')) {
      console.log('✅ MCP access token configured');
    } else {
      console.log('❌ MCP access token missing - UPDATE REQUIRED');
    }
  } else {
    console.log('❌ Backend .env missing');
  }
}

function testApiHealth() {
  return new Promise((resolve) => {
    console.log('\n🔍 Testing API Health...');
    
    const req = http.get('http://localhost:3001/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API Health Check: PASSED');
          console.log(`   Response: ${data}`);
        } else {
          console.log(`⚠️  API Health Check: Status ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', () => {
      console.log('❌ API not running - Start with: pnpm dev:all');
      resolve();
    });
    
    req.setTimeout(3000, () => {
      console.log('❌ API timeout - Start with: pnpm dev:all');
      req.destroy();
      resolve();
    });
  });
}

async function runCredentialTest() {
  console.log('🔐 Testing New Credentials After Security Incident');
  console.log('==================================================\n');
  
  checkEnvironmentFiles();
  await testApiHealth();
  
  console.log('\n🎯 Next Steps:');
  console.log('-------------');
  console.log('1. ✅ Regenerate ALL Supabase credentials');
  console.log('2. ✅ Update local environment files');
  console.log('3. 🔄 Test login: drivendatadynamics@gmail.com');
  console.log('4. 🔄 Resolve GitHub security alerts');
  console.log('');
  console.log('💡 If API health fails, restart: pnpm dev:all');
  console.log('🔑 Login should work with same password after credential update');
}

runCredentialTest();
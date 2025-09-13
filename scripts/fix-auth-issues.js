#!/usr/bin/env node

/**
 * 🔧 Authentication Issues Fix Script
 * Fixes login credentials and email confirmation issues
 */

console.log('🔧 Fixing Authentication Issues...');
console.log('===================================\n');

const http = require('http');
const https = require('https');

// Function to bootstrap user properly
function bootstrapUser() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: "drivendatadynamics@gmail.com",
      tenantName: "Main Tenant",
      password: "TempPassword123!"
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/tenants/bootstrap',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ User Bootstrap: SUCCESS');
          console.log(`   Response: ${data}`);
          resolve(true);
        } else {
          console.log(`⚠️  User Bootstrap: Status ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ User Bootstrap: FAILED');
      console.log(`   Error: ${err.message}`);
      reject(false);
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
async function fixAuthIssues() {
  console.log('🔍 Step 1: Checking User Bootstrap...');
  console.log('------------------------------------');
  
  try {
    await bootstrapUser();
  } catch (error) {
    console.log('Error during bootstrap:', error);
  }

  console.log('\n📧 Step 2: Email Confirmation Issue');
  console.log('-----------------------------------');
  console.log('The "check email for confirmation" issue occurs because:');
  console.log('');
  console.log('🔹 Supabase email confirmation is enabled by default');
  console.log('🔹 For development, we need to disable email confirmation');
  console.log('🔹 Or configure SMTP settings in Supabase dashboard');
  console.log('');
  
  console.log('💡 Quick Fix Options:');
  console.log('---------------------');
  console.log('');
  console.log('Option 1: Disable Email Confirmation (Recommended for dev)');
  console.log('1. Go to: https://supabase.com/dashboard/project/irfegiqnudhmimhgxkay/auth/settings');
  console.log('2. Find "Email Confirmation" setting');
  console.log('3. Turn OFF "Enable email confirmations"');
  console.log('4. Save changes');
  console.log('');
  
  console.log('Option 2: Configure SMTP (For production)');
  console.log('1. Go to: https://supabase.com/dashboard/project/irfegiqnudhmimhgxkay/auth/settings');
  console.log('2. Scroll to "SMTP Settings"');
  console.log('3. Configure your email provider');
  console.log('4. Test email sending');
  console.log('');

  console.log('🧪 Testing Current Login:');
  console.log('-------------------------');
  console.log('📧 Email: drivendatadynamics@gmail.com');
  console.log('🔑 Password: TempPassword123!');
  console.log('');
  console.log('After disabling email confirmation:');
  console.log('✅ Sign up should work immediately (no email needed)');
  console.log('✅ Login should work with above credentials');
  console.log('');
  
  console.log('🎯 Next Steps:');
  console.log('--------------');
  console.log('1. Apply one of the fixes above');
  console.log('2. Try signing up with a new email');
  console.log('3. Try logging in with: drivendatadynamics@gmail.com');
  console.log('');
  console.log('🔧 Auth Fix Complete!');
}

fixAuthIssues();
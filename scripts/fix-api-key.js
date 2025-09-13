#!/usr/bin/env node

/**
 * 🔧 SUPABASE API KEY FIX SCRIPT
 * 
 * This script helps you fix the API key error when signing up
 * by ensuring all environment variables are correctly configured.
 */

console.log('🔧 Fixing Supabase API Key Error...');
console.log('=====================================');
console.log();

// Check current configuration
const fs = require('fs');
const path = require('path');

const frontendEnvPath = path.join(__dirname, '../apps/frontend/.env.local');
const rootEnvPath = path.join(__dirname, '../.env');

console.log('📋 Current Configuration Check:');
console.log('-------------------------------');

// Check frontend .env.local
if (fs.existsSync(frontendEnvPath)) {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  console.log('✅ Frontend .env.local exists');
  
  if (frontendEnv.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    const anonKeyLine = frontendEnv.split('\n').find(line => line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='));
    if (anonKeyLine && !anonKeyLine.includes('PASTE_YOUR_REAL_ANON_KEY_HERE') && !anonKeyLine.includes('.example')) {
      console.log('✅ Anon key appears to be configured');
    } else {
      console.log('❌ Anon key needs to be configured');
      console.log('   Current line:', anonKeyLine);
    }
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY missing');
  }
} else {
  console.log('❌ Frontend .env.local missing');
}

// Check root .env
if (fs.existsSync(rootEnvPath)) {
  console.log('✅ Root .env exists');
} else {
  console.log('❌ Root .env missing');
}

console.log();
console.log('🎯 SOLUTION STEPS:');
console.log('==================');
console.log();
console.log('1. Get your REAL Supabase anon key:');
console.log('   → Open: https://supabase.com/dashboard/project/irfegiqnudhmimhgxkay/settings/api');
console.log('   → Find "Project API keys" section');
console.log('   → Copy the "anon public" key (NOT the service_role key)');
console.log();
console.log('2. Update your frontend environment file:');
console.log('   → Edit: apps/frontend/.env.local');
console.log('   → Replace the NEXT_PUBLIC_SUPABASE_ANON_KEY value with your real key');
console.log();
console.log('3. Restart your development servers:');
console.log('   → Stop current servers (Ctrl+C)');
console.log('   → Run: pnpm dev:all');
console.log();
console.log('4. Test the sign-up:');
console.log('   → Go to: http://localhost:3000');
console.log('   → Try signing up with a test email');
console.log();

// Additional diagnostic information
console.log('🔍 DIAGNOSTIC INFO:');
console.log('===================');
console.log('Project ID: irfegiqnudhmimhgxkay');
console.log('Frontend URL: http://localhost:3000');
console.log('API URL: http://localhost:3001');
console.log('Supabase URL: https://irfegiqnudhmimhgxkay.supabase.co');
console.log();

console.log('🚨 COMMON ISSUES:');
console.log('=================');
console.log('• "supabaseKey is required" → Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('• "Failed to fetch" → API server not running on port 3001');
console.log('• "CORS error" → Frontend and API ports mismatch');
console.log('• "401 Unauthorized" → Service role key issues (backend only)');
console.log();

console.log('💡 QUICK TEST:');
console.log('==============');
console.log('After fixing the anon key, test with these credentials:');
console.log('Email: drivendatadynamics@gmail.com');
console.log('Password: TempPassword123!');
console.log('(This user should already be bootstrapped)');
console.log();
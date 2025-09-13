#!/usr/bin/env node

/**
 * Quick Setup Script for AI Calling Center
 * 
 * This script helps bootstrap the user drivendatadynamics@gmail.com
 * by calling the bootstrap API endpoint directly.
 */

async function quickSetup() {
  const email = 'drivendatadynamics@gmail.com';
  const tenantName = 'AI Calling Center';
  const password = 'TempPassword123!'; // User should change this after first login

  console.log('🚀 Quick Setup for AI Calling Center');
  console.log(`Setting up user: ${email}`);
  console.log(`Tenant: ${tenantName}`);
  console.log('');

  try {
    const response = await fetch('http://localhost:3001/tenants/bootstrap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        tenantName: tenantName,
        password: password
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log(`✓ User: ${result.email}`);
      console.log(`✓ User ID: ${result.userId}`);
      console.log(`✓ Tenant ID: ${result.tenantId}`);
      console.log(`✓ Message: ${result.message}`);
      console.log('');
      console.log('🎉 User setup complete!');
      console.log(`${email} can now log in with password: ${password}`);
      console.log('');
      console.log('⚠️  IMPORTANT: Have the user change their password after first login!');
    } else {
      console.log('❌ FAILED:');
      console.log(`Error: ${result.error}`);
      console.log('');
      console.log('💡 Make sure:');
      console.log('1. The API server is running on http://localhost:3001');
      console.log('2. Your Supabase environment variables are configured');
      console.log('3. The Supabase schema has been applied');
    }
  } catch (error) {
    console.log('❌ CONNECTION ERROR:');
    console.log(`${error.message}`);
    console.log('');
    console.log('💡 Make sure:');
    console.log('1. Run "pnpm dev:all" to start the servers');
    console.log('2. Check that the API is running on http://localhost:3001');
  }
}

quickSetup();
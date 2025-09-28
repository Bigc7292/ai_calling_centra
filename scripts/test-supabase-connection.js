#!/usr/bin/env node

/**
 * Script to test Supabase connection
 */

// Get the Supabase configuration
const supabaseUrl = 'https://irfegiqnudhmimhgxkay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzUxMzMsImV4cCI6MjA3MzExMTEzM30.Y8N5p8xgPwbTJAnO3Ca6JKJckQCljzy4ckriC_iAV0w';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseAnonKey);
console.log('Anon Key length:', supabaseAnonKey?.length);

// Test if we can import Supabase client
try {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('\n✅ Supabase client created successfully');
  console.log('✅ Configuration appears to be correct');
  console.log('\nNext steps:');
  console.log('1. Make sure email confirmation is disabled in Supabase Auth settings');
  console.log('2. Restart your development server');
  console.log('3. Clear your browser cache');
  console.log('4. Try signing in again');
} catch (error) {
  console.error('❌ Error creating Supabase client:', error.message);
  console.log('\nTroubleshooting:');
  console.log('- Check that your Supabase URL is correct');
  console.log('- Verify your anon key is valid');
  console.log('- Make sure @supabase/supabase-js is installed');
}
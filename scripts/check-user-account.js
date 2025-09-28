#!/usr/bin/env node

/**
 * Script to check if a user account exists in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://irfegiqnudhmimhgxkay.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNTEzMywiZXhwIjoyMDczMTExMTMzfQ.gF2spJ7qN2CA7EL_4XNZeTAwCNnskEqDZp50fwihGJ0';

// Create Supabase client with service key (has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  try {
    console.log('Checking for existing users in Supabase...\n');
    
    // Query auth users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (error) {
      console.log('Note: Cannot directly query auth.users table without proper permissions');
      console.log('This is expected for security reasons.\n');
      
      console.log('To check your user account:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to Authentication > Users');
      console.log('3. Check if your email (drivendatadynamics@gmail.com) exists in the list');
      console.log('4. If it exists but you cannot log in, try resetting the password\n');
    } else {
      console.log('Found users:', data);
    }
    
    console.log('Alternative solution:');
    console.log('1. Try signing up with your email again (even if you think you have an account)');
    console.log('2. If email confirmation is disabled, you should be able to log in immediately');
    console.log('3. If email confirmation is enabled, check your email for confirmation link');
    
  } catch (error) {
    console.error('Error checking users:', error.message);
  }
}

checkUsers();
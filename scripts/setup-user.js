#!/usr/bin/env node

/**
 * User Setup Script for AI Calling Center
 * 
 * This script helps set up users in the application by:
 * 1. Creating/finding users in Supabase Auth
 * 2. Bootstrapping their tenant and profile
 * 
 * Usage:
 * node scripts/setup-user.js drivendatadynamics@gmail.com "AI Calling Center" [password]
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv } from '@eva/config/dist/index.js';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/setup-user.js <email> <tenant-name> [password]');
  console.log('Example: node scripts/setup-user.js drivendatadynamics@gmail.com "AI Calling Center"');
  process.exit(1);
}

const [email, tenantName, password] = args;

async function setupUser() {
  try {
    // Load environment
    const env = loadEnv();
    
    // Create Supabase client with service role key
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Setting up user: ${email}`);
    console.log(`Tenant name: ${tenantName}`);

    // Check if user exists in auth.users
    let userId;
    const { data: existingUser, error: lookupError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser?.user) {
      userId = existingUser.user.id;
      console.log(`✓ Found existing user in auth: ${userId}`);
    } else if (password) {
      // Create new user
      console.log('Creating new user in Supabase Auth...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });
      
      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      
      userId = newUser.user?.id;
      console.log(`✓ Created new user: ${userId}`);
    } else {
      throw new Error('User not found and no password provided for user creation');
    }

    if (!userId) {
      throw new Error('Unable to determine user ID');
    }

    // Bootstrap via API endpoint
    console.log('Bootstrapping tenant via API...');
    const response = await fetch(`http://localhost:3001/tenants/bootstrap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        email: email,
        tenantName: tenantName
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Bootstrap failed: ${result.error}`);
    }

    console.log('✓ Bootstrap completed successfully!');
    console.log(`✓ Tenant ID: ${result.tenantId}`);
    console.log(`✓ User ID: ${result.userId}`);
    console.log(`✓ Email: ${result.email}`);
    
    console.log('\n🎉 User setup complete!');
    console.log(`\nThe user ${email} can now log in to the application.`);
    console.log('If this is a new user, they should use the password you provided.');
    console.log('If this is an existing user, they should use their existing password.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupUser();
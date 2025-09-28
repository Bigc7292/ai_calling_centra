#!/usr/bin/env node

/**
 * Script to fix authentication settings in Supabase
 * This script will help configure email confirmation settings
 */

console.log('🔧 Fixing Supabase Authentication Settings...\n');

console.log('Please follow these steps to fix your authentication issues:\n');

console.log('1. Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/irfegiqnudhmimhgxkay\n');

console.log('2. Navigate to Authentication > Settings');
console.log('   Path: Auth > Settings in the left sidebar\n');

console.log('3. Find and DISABLE "Enable email confirmations"');
console.log('   - This setting prevents users from logging in until they confirm their email');
console.log('   - For development, it\'s recommended to disable this setting\n');

console.log('4. Also check these settings:');
console.log('   - Enable "Allow/disallow new user signups" - should be ENABLED');
console.log('   - Enable "Secure email change" - can be DISABLED for development\n');

console.log('5. After making changes, restart your development server:');
console.log('   - Stop your current development server (Ctrl+C)');
console.log('   - Run: npm run dev (from the frontend directory)\n');

console.log('6. If you still have issues, try these troubleshooting steps:');
console.log('   - Clear your browser cache and cookies for localhost');
console.log('   - Try logging in with an incognito/private browser window');
console.log('   - Make sure you\'re using the correct email and password\n');

console.log('💡 Pro tip: For development, you can also sign up a new user and immediately log in');
console.log('   without email confirmation if you\'ve disabled the email confirmation setting.\n');

console.log('For any further issues, please check the Supabase documentation:');
console.log('https://supabase.com/docs/guides/auth');
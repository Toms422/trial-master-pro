#!/usr/bin/env node

/**
 * Script to apply database migration to Supabase
 * This applies the anonymous QR code access policies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('   VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set');
  process.exit(1);
}

// Read the migration file
const migrationFile = path.join(__dirname, 'supabase/migrations/20251117125953_add_anonymous_qr_access.sql');

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Error: Migration file not found: ${migrationFile}`);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');

console.log('📝 Migration file loaded successfully');
console.log(`📊 SQL Length: ${migrationSQL.length} characters`);
console.log('');
console.log('🔑 Supabase Project:', supabaseUrl.split('.')[0]);
console.log('');
console.log('⚠️  IMPORTANT: This migration needs to be applied manually in the Supabase dashboard:');
console.log('');
console.log('1. Go to: ' + supabaseUrl + '/project/*/sql');
console.log('2. Click "New query"');
console.log('3. Copy and paste the SQL below:');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(migrationSQL);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('4. Click "Run" to apply the migration');
console.log('5. Verify the check-in page works with QR codes');
console.log('');
console.log('✅ After applying, the QR code check-in will work for new participants!');

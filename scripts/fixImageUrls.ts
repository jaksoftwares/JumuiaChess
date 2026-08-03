import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase environment variables for migration script.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_URL = 'http://localhost:5000/uploads/';
const REPLACEMENT_URL = '/uploads/'; // Resolves directly to Next.js public/uploads folder

async function fixTable(tableName: string, urlColumn: string) {
  console.log(`Scanning [${tableName}] for broken image URLs...`);
  const { data, error } = await supabaseAdmin.from(tableName).select(`id, ${urlColumn}`);
  
  if (error || !data) {
    console.error(`Failed to fetch ${tableName}:`, error?.message);
    return;
  }

  let updatedCount = 0;
  for (const row of data as any[]) {
    const currentUrl = row[urlColumn];
    if (currentUrl && typeof currentUrl === 'string' && currentUrl.includes(TARGET_URL)) {
      const newUrl = currentUrl.replace(TARGET_URL, REPLACEMENT_URL);
      
      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({ [urlColumn]: newUrl })
        .eq('id', row.id);
        
      if (updateError) {
        console.error(`Failed to update ${tableName} ID ${row.id}:`, updateError.message);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Updated ${updatedCount} records in ${tableName}.`);
}

async function runMigration() {
  console.log('Starting Image URL Migration to fix local port 5000 references...\n');
  
  await fixTable('tournaments', 'poster_url');
  await fixTable('products', 'image_url');
  await fixTable('blog_posts', 'cover_image');
  await fixTable('gallery', 'image_url');
  await fixTable('team_members', 'image_url');
  await fixTable('partners', 'logo_url');
  
  console.log('\nMigration complete! All images will now load securely from Next.js relative paths.');
}

runMigration();

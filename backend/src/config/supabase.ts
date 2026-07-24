import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('[DB] Initializing Supabase client');
console.log(`[DB] Supabase URL configured: ${supabaseUrl ? 'yes' : 'no'}`);
console.log(`[DB] Service role key configured: ${supabaseServiceRoleKey ? 'yes' : 'no'}`);

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    transport: ws as any
  }
});

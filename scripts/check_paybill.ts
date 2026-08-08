import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkPaybill() {
  const { data, error } = await supabaseAdmin.from('site_settings').select('mpesa_paybill').single();
  console.log('Error:', error);
  console.log('Data:', data);
}

checkPaybill();

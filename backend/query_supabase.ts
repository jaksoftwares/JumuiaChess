import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const url = `${process.env.SUPABASE_URL}/rest/v1/registrations?id=eq.1ddd182e-4409-4d10-b89e-7d761c198fbc&select=id,payment_status,mpesa_receipt`;

async function run() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      }
    });
    const data = await res.json();
    console.log('Row fetch result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching:', error);
  }
}

run();

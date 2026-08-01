const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: './backend/.env'});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('partners').select('*');
  console.log("Partners:", data);
}
check();

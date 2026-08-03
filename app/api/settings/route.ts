import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin.from('site_settings').select('*').single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    
    // Return empty settings object if none exists yet
    return NextResponse.json({ success: true, data: data || {} });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_name, org_email, org_phone, hero_title, hero_subtitle, about_text, social_links } = body;
    
    // Upsert since there's typically only one settings row
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert([{ 
        id: '1', // Ensure a single row or use logic matching backend
        org_name, org_email, org_phone, hero_title, hero_subtitle, about_text, social_links 
      }])
      .select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

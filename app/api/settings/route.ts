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
  return PUT(request); // Route both POST and PUT to the same upsert handler
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract exact properties matching the SiteSettings interface and schema
    const { 
      org_email, 
      org_phone, 
      mpesa_paybill,
      instagram_url,
      facebook_url,
      youtube_url,
      shop_enabled,
      our_story_title,
      our_story_heading,
      our_story_paragraph_1,
      our_story_paragraph_2
    } = body;
    
    // Upsert since there's exactly one settings row (id = 1)
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert([{ 
        id: 1, 
        org_email, 
        org_phone, 
        mpesa_paybill,
        instagram_url,
        facebook_url,
        youtube_url,
        shop_enabled,
        our_story_title,
        our_story_heading,
        our_story_paragraph_1,
        our_story_paragraph_2,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[API Settings Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

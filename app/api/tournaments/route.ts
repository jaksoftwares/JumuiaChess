import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/tournaments
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    
    // Using Next.js native response, cache controlled via fetch tag revalidation or default dynamic rendering
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/tournaments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, poster_url, event_date, venue, categories, entry_fee, description, status } = body;
    
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .insert([{ name, poster_url, event_date, venue, categories, entry_fee, description, status }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

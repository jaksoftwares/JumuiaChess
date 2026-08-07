import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/tournaments
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .select('*, registrations(count)')
      .order('event_date', { ascending: true });

    if (error) throw error;
    
    // Format the response to map registrations[0].count to a simpler property
    const formattedData = data.map((t: any) => ({
      ...t,
      registrations_count: t.registrations?.[0]?.count || 0
    }));

    // Using Next.js native response, cache controlled via fetch tag revalidation or default dynamic rendering
    return NextResponse.json({ success: true, data: formattedData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/tournaments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, poster_url, event_date, venue, categories, entry_fee, description, status, max_participants, registration_deadline, terms_url } = body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
    
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .insert([{ name, slug, poster_url, event_date, venue, categories, entry_fee, description, status, max_participants, registration_deadline, terms_url }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

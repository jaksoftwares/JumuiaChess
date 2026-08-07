import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/tournaments/:id (or slug)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const idOrSlug = (await params).id;
    
    // Check if it's a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .select('*, registrations(count)')
      .eq(isUuid ? 'id' : 'slug', idOrSlug)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    }
    
    const formattedData = {
      ...data,
      registrations_count: data.registrations?.[0]?.count || 0
    };

    return NextResponse.json({ success: true, data: formattedData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/tournaments/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const { name, poster_url, event_date, venue, categories, entry_fee, description, status } = body;
    
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .update({ name, poster_url, event_date, venue, categories, entry_fee, description, status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/tournaments/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const { error } = await supabaseAdmin.from('tournaments').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Tournament deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

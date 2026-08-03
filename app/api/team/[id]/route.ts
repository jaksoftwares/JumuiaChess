import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const { name, role, bio, image_url, social_links } = body;
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({ name, role, bio, image_url, social_links })
      .eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const { error } = await supabaseAdmin.from('team_members').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Team member deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

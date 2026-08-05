import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// PUT /api/videos/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, youtube_url, description, is_featured } = body;

    // If this video is marked as featured, unfeature others
    if (is_featured) {
      await supabaseAdmin.from('videos').update({ is_featured: false }).neq('id', id);
    }

    const { data, error } = await supabaseAdmin
      .from('videos')
      .update({
        title,
        youtube_url,
        description,
        is_featured,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/videos/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting video:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/videos
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/videos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, youtube_url, description, is_featured } = body;

    if (!title || !youtube_url || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // If this video is marked as featured, optionally unfeature others if we only want one featured at a time
    if (is_featured) {
      await supabaseAdmin.from('videos').update({ is_featured: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // update all
    }

    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert([
        {
          title,
          youtube_url,
          description,
          is_featured: is_featured || false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating video:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

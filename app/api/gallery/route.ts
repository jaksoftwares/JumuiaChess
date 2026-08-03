import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin.from('gallery_images').select('*').order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01') return NextResponse.json({ success: true, data: [] });
      throw error;
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_url, caption, category, featured } = body;
    const { data, error } = await supabaseAdmin
      .from('gallery_images')
      .insert([{ image_url, caption, category, featured }])
      .select().single();
    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ success: false, error: 'Table "gallery_images" does not exist in Supabase database yet.' }, { status: 400 });
      }
      throw error;
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

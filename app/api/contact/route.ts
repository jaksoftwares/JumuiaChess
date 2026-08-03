import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendContactNotification } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{ name, email, message }])
      .select().single();

    if (error) throw error;

    // Send email to admin
    sendContactNotification(name, email, message).catch(err => {
      console.error('Failed to send contact notification:', err);
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/donations
export async function GET(request: NextRequest) {
  try {
    // Basic admin check - in a real app, verify the session/token here
    const authHeader = request.headers.get('authorization');
    const bypassHeader = request.headers.get('x-admin-dev-bypass');
    if (!authHeader && !bypassHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: donations, error } = await supabaseAdmin
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching donations:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: donations });
  } catch (err: any) {
    console.error('Error in GET /api/donations:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

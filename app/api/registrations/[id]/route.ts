import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/registrations/[id] - Get a single registration and its tournament data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Can search by ID or ticket_number
    const queryCol = id.startsWith('JUM-TKT-') ? 'ticket_number' : 'id';

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*, tournaments(name, event_date, venue)')
      .eq(queryCol, id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/registrations/[id] - Get a single registration and its tournament data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Can search by ID (UUID), full ticket_number (JUM-TKT-XXXXXX), or 6-char short ID (XXXXXX)
    let queryCol = 'id';
    let queryValue = id;

    if (id.startsWith('JUM-TKT-')) {
      queryCol = 'ticket_number';
      queryValue = id.toUpperCase();
    } else if (id.length === 6) {
      queryCol = 'ticket_number';
      queryValue = `JUM-TKT-${id.toUpperCase()}`;
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*, tournaments(name, event_date, venue)')
      .eq(queryCol, queryValue)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

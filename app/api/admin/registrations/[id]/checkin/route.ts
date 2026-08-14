import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// PUT /api/admin/registrations/[id]/checkin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // 'registered' or 'checked-in'

    if (!['registered', 'checked-in'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // If attempting to check in, verify payment is completed
    if (status === 'checked-in') {
      const { data: reg, error: regError } = await supabaseAdmin
        .from('registrations')
        .select('payment_status')
        .eq('id', id)
        .single();
        
      if (regError) {
        throw new Error('Failed to verify registration payment status.');
      }
      
      if (reg.payment_status !== 'completed') {
        return NextResponse.json({ success: false, error: 'Payment must be completed before check-in.' }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update({ attendance_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

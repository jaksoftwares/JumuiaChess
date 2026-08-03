import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/mpesa/status/:checkoutRequestId
export async function GET(request: NextRequest, { params }: { params: Promise<{ checkoutRequestId: string }> }) {
  try {
    const checkoutRequestId = (await params).checkoutRequestId;
    
    if (!checkoutRequestId) {
      return NextResponse.json({ error: 'Checkout request ID is required' }, { status: 400 });
    }

    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('*, tournaments(name)')
      .eq('checkout_request_id', checkoutRequestId)
      .maybeSingle();

    if (registration) {
      return NextResponse.json({
        success: true,
        type: 'registration',
        paymentStatus: registration.payment_status,
        mpesaReceipt: registration.mpesa_receipt,
        registration: {
          playerName: registration.player_name,
          category: registration.category,
          fideId: registration.fide_id || '00',
          tournamentName: registration.tournaments?.name || 'Tournament',
          amount: registration.amount,
          id: registration.id.slice(-6)
        }
      });
    }

    const { data: order } = await supabaseAdmin
      .from('shop_orders')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .maybeSingle();

    if (order) {
      return NextResponse.json({
        success: true,
        type: 'order',
        paymentStatus: order.payment_status,
        mpesaReceipt: order.mpesa_receipt,
        order
      });
    }

    return NextResponse.json({ success: true, paymentStatus: 'pending' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

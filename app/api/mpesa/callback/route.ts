import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendRegistrationConfirmation } from '@/lib/email';

// POST /api/mpesa/callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received M-Pesa Callback:', JSON.stringify(body, null, 2));

    const { Body } = body;
    if (!Body || !Body.stkCallback) {
      return NextResponse.json({ error: 'Invalid callback body structure' }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = Body.stkCallback;

    let mpesaReceipt = '';
    if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
      const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
      if (receiptItem) {
        mpesaReceipt = receiptItem.Value;
      }
    }

    const paymentStatus = ResultCode === 0 ? 'completed' : 'failed';

    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('*, tournaments(name)')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (registration) {
      await supabaseAdmin.from('registrations').update({ payment_status: paymentStatus, mpesa_receipt: mpesaReceipt }).eq('id', registration.id);

      if (ResultCode === 0 && registration.email) {
        await sendRegistrationConfirmation(registration.email, {
          playerName: registration.player_name,
          tournamentName: registration.tournaments?.name || 'Tournament',
          amount: parseFloat(registration.amount),
          category: registration.category
        });
      }
      return NextResponse.json({ success: true, type: 'registration' });
    }

    const { data: order } = await supabaseAdmin.from('shop_orders').select('*').eq('checkout_request_id', CheckoutRequestID).single();
    if (order) {
      await supabaseAdmin.from('shop_orders').update({ payment_status: paymentStatus, mpesa_receipt: mpesaReceipt }).eq('id', order.id);
      return NextResponse.json({ success: true, type: 'order' });
    }

    return NextResponse.json({ success: false, message: 'No matching transaction record found' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

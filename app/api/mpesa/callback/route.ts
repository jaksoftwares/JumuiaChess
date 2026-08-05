import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendRegistrationConfirmation, sendDonationReceipt, notifyAdminOfDonation, sendOrderReceipt, notifyAdminOfOrder } from '@/lib/email';

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
    } else if (ResultCode === 1032) {
      console.log(`[M-PESA] Transaction ${CheckoutRequestID} was cancelled by the user.`);
    }

    const paymentStatus = ResultCode === 0 ? 'completed' : 'failed';

    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('*, tournaments(name)')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (registration) {
      if (registration.payment_status === 'completed') {
        console.log(`[M-PESA] Registration ${registration.id} is already marked as completed. Ignoring duplicate callback.`);
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

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
      if (order.payment_status === 'completed') {
        console.log(`[M-PESA] Shop order ${order.id} is already marked as completed. Ignoring duplicate callback.`);
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      await supabaseAdmin.from('shop_orders').update({ payment_status: paymentStatus, mpesa_receipt: mpesaReceipt }).eq('id', order.id);

      if (ResultCode === 0) {
        if (order.email) {
          await sendOrderReceipt(order.email, {
            customerName: order.customer_name,
            amount: parseFloat(order.amount),
            receipt: mpesaReceipt,
            items: order.items || [],
            address: order.shipping_address
          });
        }
        await notifyAdminOfOrder({
          customerName: order.customer_name,
          email: order.email || '',
          phone: order.phone_number,
          amount: parseFloat(order.amount),
          receipt: mpesaReceipt,
          items: order.items || [],
          address: `${order.shipping_address}, ${order.city}`
        });
      }

      return NextResponse.json({ success: true, type: 'order' });
    }
    const { data: donation } = await supabaseAdmin.from('donations').select('*').eq('checkout_request_id', CheckoutRequestID).single();
    if (donation) {
      if (donation.payment_status === 'completed') {
        console.log(`[M-PESA] Donation ${donation.id} is already marked as completed.`);
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      await supabaseAdmin.from('donations').update({ payment_status: paymentStatus, mpesa_receipt: mpesaReceipt }).eq('id', donation.id);

      if (ResultCode === 0) {
        if (donation.email) {
          await sendDonationReceipt(donation.email, {
            donorName: donation.donor_name || 'Supporter',
            amount: parseFloat(donation.amount),
            receipt: mpesaReceipt
          });
        }
        await notifyAdminOfDonation({
          donorName: donation.donor_name || 'Anonymous',
          amount: parseFloat(donation.amount),
          receipt: mpesaReceipt,
          message: donation.donor_message || ''
        });
      }
      return NextResponse.json({ success: true, type: 'donation' });
    }

    return NextResponse.json({ success: false, message: 'No matching transaction record found' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { initiateStkPush } from '@/lib/mpesa';

// POST /api/donations/initiate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donorName, email, phoneNumber, amount, message } = body;

    const parsedAmount = amount !== undefined && amount !== null ? parseFloat(amount.toString()) : 0;

    if (!phoneNumber || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Phone number and a valid amount are required.' }, { status: 400 });
    }

    // 1. Insert pending donation record
    const { data: donation, error: insertError } = await supabaseAdmin
      .from('donations')
      .insert([{
        donor_name: donorName || 'Anonymous',
        email: email || null,
        phone_number: phoneNumber,
        amount: parsedAmount,
        donor_message: message || null,
        payment_channel: 'stk',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Initiate STK Push
    try {
      const stkResult = await initiateStkPush(
        phoneNumber,
        parsedAmount,
        `DON-${donation.id.substring(0, 5)}`,
        `Donation to Jumuia Chess`
      );

      // 3. Update with checkoutRequestId
      await supabaseAdmin
        .from('donations')
        .update({ checkout_request_id: stkResult.checkoutRequestId })
        .eq('id', donation.id);

      return NextResponse.json({
        success: true,
        message: 'STK push initiated successfully.',
        data: {
          checkoutRequestId: stkResult.checkoutRequestId,
          donationId: donation.id
        }
      });
    } catch (stkError: any) {
      // Mark as failed if STK push fails to initiate
      await supabaseAdmin.from('donations').update({ payment_status: 'failed' }).eq('id', donation.id);
      return NextResponse.json({ success: false, error: stkError.message }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

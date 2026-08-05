import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { initiateStkPush } from '@/lib/mpesa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phoneNumber, email, shippingAddress, city, items, amount } = body;

    if (!customerName || !phoneNumber || !items || !amount || !email || !shippingAddress || !city) {
      return NextResponse.json({ error: 'Missing checkout requirements' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('shop_orders')
      .insert([{
        customer_name: customerName,
        phone_number: phoneNumber,
        email,
        shipping_address: shippingAddress,
        city,
        items,
        amount: parseFloat(amount),
        payment_status: 'pending',
        delivery_status: 'pending',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    try {
      const stkResult = await initiateStkPush(
        phoneNumber,
        parseFloat(amount),
        `ORD-${order.id.substring(0, 5)}`,
        `Chess Store Order`
      );

      await supabaseAdmin
        .from('shop_orders')
        .update({ checkout_request_id: stkResult.checkoutRequestId })
        .eq('id', order.id);

      return NextResponse.json({
        success: true,
        message: 'Checkout STK push initiated successfully.',
        checkoutRequestId: stkResult.checkoutRequestId,
      });
    } catch (stkError: any) {
      console.error('Checkout M-Pesa STK Push failed:', stkError.message);
      await supabaseAdmin.from('shop_orders').update({ payment_status: 'failed' }).eq('id', order.id);

      return NextResponse.json({
        success: false,
        error: stkError.message || 'Failed to trigger payment STK Push. Order marked as failed.',
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

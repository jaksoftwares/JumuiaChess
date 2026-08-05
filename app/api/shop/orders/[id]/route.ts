import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendOrderShippedNotification } from '@/lib/email';

// PUT /api/shop/orders/[id] - Update order (delivery status, notes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { delivery_status, delivery_notes } = body;

    // Get current order state to check if status is changing to shipped
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('shop_orders')
      .select('delivery_status, email, customer_name, mpesa_receipt')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabaseAdmin
      .from('shop_orders')
      .update({ delivery_status, delivery_notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If status changed TO shipped, send the email
    if (delivery_status === 'shipped' && currentOrder.delivery_status !== 'shipped' && currentOrder.email) {
      await sendOrderShippedNotification(currentOrder.email, {
        customerName: currentOrder.customer_name,
        receipt: currentOrder.mpesa_receipt || 'Order Shipped',
        deliveryNotes: delivery_notes
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/shop/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from('shop_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

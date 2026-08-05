import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendDeliveryStatusUpdate } from '@/lib/email';

// PUT /api/shop/orders/[id] - Update order (delivery status, notes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { delivery_status, delivery_notes } = body;

    // Get current order state to check if status or notes changed
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('shop_orders')
      .select('delivery_status, delivery_notes, email, customer_name, mpesa_receipt')
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

    // Check if status or notes changed
    const statusChanged = delivery_status !== currentOrder.delivery_status;
    const notesChanged = delivery_notes !== currentOrder.delivery_notes;

    // If either changed, and we have an email, send the update
    if ((statusChanged || notesChanged) && currentOrder.email) {
      await sendDeliveryStatusUpdate(currentOrder.email, {
        customerName: currentOrder.customer_name,
        receipt: currentOrder.mpesa_receipt || 'Store Order',
        status: delivery_status,
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

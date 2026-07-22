import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { initiateStkPush } from '../services/mpesa.service';
import { sendRegistrationConfirmation } from '../services/email.service';

// POST /api/mpesa/register
export const registerWithMpesa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId, playerName, email, age, school, category, phoneNumber, amount } = req.body;

    if (!tournamentId || !playerName || !age || !category || !phoneNumber || !amount) {
      return res.status(400).json({ error: 'Missing required registration details' });
    }

    // 1. Create a pending registration in the database
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([{
        tournament_id: tournamentId,
        player_name: playerName,
        email,
        age: parseInt(age),
        school,
        category,
        phone_number: phoneNumber,
        amount: parseFloat(amount),
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (regError) throw regError;

    // Fetch tournament name
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('name')
      .eq('id', tournamentId)
      .single();
    const tournamentName = tournament?.name || 'Tournament';

    // 2. Trigger M-Pesa STK Push
    try {
      const stkResult = await initiateStkPush(
        phoneNumber,
        parseFloat(amount),
        `REG-${registration.id.substring(0, 5)}`,
        `Reg: ${tournamentName.substring(0, 15)}`
      );

      // Update the registration with the checkout request id
      await supabase
        .from('registrations')
        .update({ checkout_request_id: stkResult.checkoutRequestId })
        .eq('id', registration.id);

      res.json({
        success: true,
        message: 'STK push initiated successfully.',
        checkoutRequestId: stkResult.checkoutRequestId
      });
    } catch (stkError: any) {
      console.error('M-Pesa STK Push initiation failed:', stkError.message);
      // Mark registration status as failed
      await supabase
        .from('registrations')
        .update({ payment_status: 'failed' })
        .eq('id', registration.id);

      res.status(400).json({
        success: false,
        error: stkError.message || 'Failed to initiate M-Pesa STK push. Registration marked as failed.'
      });
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/mpesa/callback (Public webhook called by Safaricom)
export const mpesaCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Received M-Pesa Callback:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ error: 'Invalid callback body structure' });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = Body.stkCallback;

    // Extract Receipt No from CallbackMetadata if successful
    let mpesaReceipt = '';
    if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
      const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
      if (receiptItem) {
        mpesaReceipt = receiptItem.Value;
      }
    }

    const paymentStatus = ResultCode === 0 ? 'completed' : 'failed';

    // 1. Check if this belongs to a tournament registration
    const { data: registration, error: regFindError } = await supabase
      .from('registrations')
      .select('*, tournaments(name)')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (registration) {
      // Update registration status
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ payment_status: paymentStatus, mpesa_receipt: mpesaReceipt })
        .eq('id', registration.id);

      if (updateError) throw updateError;

      // Send email if payment completed successfully and email is provided
      if (ResultCode === 0 && registration.email) {
        await sendRegistrationConfirmation(registration.email, {
          playerName: registration.player_name,
          tournamentName: registration.tournaments?.name || 'Tournament',
          amount: parseFloat(registration.amount),
          category: registration.category
        });
      }
      
      console.log(`Updated registration ${registration.id} status to ${paymentStatus}`);
      return res.json({ success: true, type: 'registration' });
    }

    // 2. Check if this belongs to a shop order
    const { data: order, error: orderFindError } = await supabase
      .from('shop_orders')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (order) {
      // Update order status
      const { error: updateError } = await supabase
        .from('shop_orders')
        .update({ payment_status: paymentStatus, mpesa_receipt: mpesaReceipt })
        .eq('id', order.id);

      if (updateError) throw updateError;

      console.log(`Updated shop order ${order.id} status to ${paymentStatus}`);
      return res.json({ success: true, type: 'order' });
    }

    console.warn(`No matching transaction found for CheckoutRequestID: ${CheckoutRequestID}`);
    res.json({ success: false, message: 'No matching transaction record found' });
  } catch (err) {
    next(err);
  }
};

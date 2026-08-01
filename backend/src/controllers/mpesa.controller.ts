import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { initiateStkPush } from '../services/mpesa.service';
import { sendRegistrationConfirmation } from '../services/email.service';

// POST /api/mpesa/register
export const registerWithMpesa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId, playerName, email, age, school, category, phoneNumber, amount } = req.body;

    const parsedAge = age !== undefined && age !== null ? parseInt(age.toString()) : 0;
    const parsedAmount = amount !== undefined && amount !== null ? parseFloat(amount.toString()) : 0;

    if (!tournamentId || !playerName || !category || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required registration details: Please ensure all required fields are filled.' });
    }

    const isFree = parsedAmount === 0;

    // 1. Create a registration in the database
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([{
        tournament_id: tournamentId,
        player_name: playerName,
        email,
        age: parsedAge,
        school,
        category,
        phone_number: phoneNumber,
        amount: parsedAmount,
        payment_status: isFree ? 'completed' : 'pending'
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

    // If free entry (e.g. PWD/DAP), complete registration without STK push
    if (isFree) {
      if (email) {
        sendRegistrationConfirmation(email, {
          playerName,
          tournamentName,
          amount: 0,
          category
        }).catch((err) => console.error('Email error:', err));
      }
      return res.json({
        success: true,
        message: 'Free registration completed successfully.'
      });
    }

    // 2. Trigger M-Pesa STK Push for paid entries
    try {
      const stkResult = await initiateStkPush(
        phoneNumber,
        parsedAmount,
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

// GET /api/mpesa/status/:checkoutRequestId
export const getMpesaPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkoutRequestId } = req.params;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'Checkout request ID is required' });
    }

    // 1. Check tournament registration
    const { data: registration } = await supabase
      .from('registrations')
      .select('*, tournaments(name)')
      .eq('checkout_request_id', checkoutRequestId)
      .maybeSingle();

    if (registration) {
      return res.json({
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

    // 2. Check shop order
    const { data: order } = await supabase
      .from('shop_orders')
      .select('*')
      .eq('checkout_request_id', checkoutRequestId)
      .maybeSingle();

    if (order) {
      return res.json({
        success: true,
        type: 'order',
        paymentStatus: order.payment_status,
        mpesaReceipt: order.mpesa_receipt,
        order
      });
    }

    return res.json({
      success: true,
      paymentStatus: 'pending'
    });
  } catch (err) {
    next(err);
  }
};

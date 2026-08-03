import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { initiateStkPush } from '@/lib/mpesa';
import { sendRegistrationConfirmation } from '@/lib/email';

// POST /api/mpesa/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tournamentId, playerName, email, age, school, category, phoneNumber, amount } = body;

    const parsedAge = age !== undefined && age !== null ? parseInt(age.toString()) : 0;
    const parsedAmount = amount !== undefined && amount !== null ? parseFloat(amount.toString()) : 0;

    if (!tournamentId || !playerName || !category || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required registration details' }, { status: 400 });
    }

    const isFree = parsedAmount === 0;

    const { data: registration, error: regError } = await supabaseAdmin
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

    const { data: tournament } = await supabaseAdmin.from('tournaments').select('name').eq('id', tournamentId).single();
    const tournamentName = tournament?.name || 'Tournament';

    if (isFree) {
      if (email) {
        sendRegistrationConfirmation(email, {
          playerName,
          tournamentName,
          amount: 0,
          category
        }).catch((err) => console.error('Email error:', err));
      }
      return NextResponse.json({ success: true, message: 'Free registration completed successfully.' });
    }

    try {
      const stkResult = await initiateStkPush(
        phoneNumber,
        parsedAmount,
        `REG-${registration.id.substring(0, 5)}`,
        `Reg: ${tournamentName.substring(0, 15)}`
      );

      await supabaseAdmin
        .from('registrations')
        .update({ checkout_request_id: stkResult.checkoutRequestId })
        .eq('id', registration.id);

      return NextResponse.json({
        success: true,
        message: 'STK push initiated successfully.',
        checkoutRequestId: stkResult.checkoutRequestId
      });
    } catch (stkError: any) {
      await supabaseAdmin.from('registrations').update({ payment_status: 'failed' }).eq('id', registration.id);
      return NextResponse.json({ success: false, error: stkError.message }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

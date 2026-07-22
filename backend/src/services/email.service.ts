import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const resend = RESEND_API_KEY && RESEND_API_KEY !== 're_mock' 
  ? new Resend(RESEND_API_KEY) 
  : null;

// Send tournament registration confirmation
export const sendRegistrationConfirmation = async (
  email: string,
  details: { playerName: string; tournamentName: string; amount: number; category: string }
): Promise<void> => {
  const subject = `Registration Confirmed: ${details.tournamentName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6B4A34;">The Gift of Chess</h2>
      <p>Hello ${details.playerName},</p>
      <p>Your registration for <strong>${details.tournamentName}</strong> has been successfully received and confirmed!</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p><strong>Registration Details:</strong></p>
      <ul>
        <li><strong>Player Name:</strong> ${details.playerName}</li>
        <li><strong>Tournament:</strong> ${details.tournamentName}</li>
        <li><strong>Category:</strong> ${details.category}</li>
        <li><strong>Entry Fee Paid:</strong> KES ${details.amount}</li>
      </ul>
      <p>We look forward to seeing you at the tournament!</p>
      <p style="font-size: 0.8em; color: #888; margin-top: 40px;">This is an automated email from The Gift of Chess.</p>
    </div>
  `;

  if (!resend) {
    console.log(`[EMAIL MOCK] Sending registration confirmation to ${email}:\nSubject: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'The Gift of Chess <noreply@giftofchess.org>',
      to: email,
      subject,
      html,
    });
    console.log(`Registration confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending registration confirmation email:', error);
  }
};

// Send contact message notification to admins
export const sendContactNotification = async (
  senderName: string,
  senderEmail: string,
  message: string
): Promise<void> => {
  const subject = `New Contact Message from ${senderName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6B4A34;">New Contact Inquiry</h2>
      <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px;">${message}</p>
    </div>
  `;

  if (!resend) {
    console.log(`[EMAIL MOCK] Sending contact notification:\nSubject: ${subject}\nMessage: ${message}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'The Gift of Chess Contact Form <noreply@giftofchess.org>',
      to: 'info@giftofchess.org',
      subject,
      html,
    });
    console.log('Contact notification email sent to admin inbox.');
  } catch (error) {
    console.error('Error sending contact notification email:', error);
  }
};

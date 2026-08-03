import { Resend } from 'resend';
import { supabaseAdmin } from './supabase/admin';
// import nodemailer from 'nodemailer'; // Nodemailer requires 'net' which is sometimes problematic on Edge runtime depending on NextJS config. We'll stick to Resend.

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = RESEND_API_KEY && RESEND_API_KEY !== 're_mock' ? new Resend(RESEND_API_KEY) : null;

export const sendRegistrationConfirmation = async (
  email: string,
  details: { playerName: string; tournamentName: string; amount: number; category: string }
): Promise<void> => {
  const subject = `Registration Confirmed: ${details.tournamentName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6B4A34;">Jumuiya Chess</h2>
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
      <p style="font-size: 0.8em; color: #888; margin-top: 40px;">This is an automated email from Jumuiya Chess.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Jumuiya Chess <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });
      console.log(`[Resend] Registration confirmation email sent to ${email}`);
      return;
    } catch (error) {
      console.error('[Resend Error] Failed to send registration email:', error);
    }
  }

  console.log(`[EMAIL MOCK] Registration confirmation to ${email}:\nSubject: ${subject}`);
};

export const sendContactNotification = async (
  senderName: string,
  senderEmail: string,
  message: string
): Promise<void> => {
  const subject = `New Contact Inquiry from ${senderName} (${senderEmail})`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <p><strong>Sender Details</strong></p>
      <p>Name: ${senderName}</p>
      <p>Email: ${senderEmail}</p>
      <p>Message:</p>
      <p>${message}</p>
    </body>
    </html>
  `;

  let recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'iykekonzolaw21@gmail.com';
  try {
    const { data } = await supabaseAdmin.from('site_settings').select('org_email').single();
    if (data && data.org_email) {
      recipientEmail = data.org_email;
    }
  } catch (err) { }

  if (resend) {
    try {
      await resend.emails.send({
        from: `${senderName} <onboarding@resend.dev>`,
        reply_to: senderEmail,
        to: recipientEmail,
        subject,
        html,
      });
      console.log(`[Resend Email] Contact notification sent to admin inbox: ${recipientEmail}`);
      return;
    } catch (error) {
      console.error('[Resend Error] Failed sending contact notification email:', error);
    }
  }

  console.log(`[EMAIL MOCK] Notification for admin (${recipientEmail}):\nSender: ${senderName} (${senderEmail})\nSubject: ${subject}\nMessage: ${message}`);
};

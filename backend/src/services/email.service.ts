import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { supabase } from '../config/supabase';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = RESEND_API_KEY && RESEND_API_KEY !== 're_mock' ? new Resend(RESEND_API_KEY) : null;

// SMTP Transporter setup (e.g. Gmail App Password, Mailtrap, or Custom SMTP)
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;

const nodemailerTransporter = (smtpUser && smtpPass)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

// Send tournament registration confirmation
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

  if (nodemailerTransporter) {
    try {
      await nodemailerTransporter.sendMail({
        from: `"Jumuiya Chess" <${smtpUser}>`,
        to: email,
        subject,
        html,
      });
      console.log(`[SMTP] Registration confirmation email sent to ${email}`);
      return;
    } catch (err) {
      console.error('[SMTP Error] Failed to send registration email:', err);
    }
  }

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

// Send contact message notification to configured admin email
export const sendContactNotification = async (
  senderName: string,
  senderEmail: string,
  message: string
): Promise<void> => {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `New Contact Inquiry from ${senderName} (${senderEmail})`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F4F1EA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F1EA; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #EAE4D9;">
              
              <!-- CHESS BRAND HEADER -->
              <tr>
                <td style="background-color: #16171A; padding: 32px 30px; text-align: center; border-bottom: 3px solid #C8B195;">
                  <div style="font-size: 28px; line-height: 1; margin-bottom: 8px;">♔</div>
                  <h1 style="color: #FFFFFF; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: bold; margin: 0; tracking-wide: 1px;">JUMUIYA CHESS</h1>
                  <p style="color: #C8B195; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 6px 0 0 0; font-weight: 600;">Website Contact Form Inquiry</p>
                </td>
              </tr>

              <!-- BODY CONTAINER -->
              <tr>
                <td style="padding: 32px 30px; background-color: #ffffff;">
                  
                  <!-- SENDER BADGE CARD -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; border-radius: 12px; border-left: 4px solid #6B4A34; margin-bottom: 24px; border-top: 1px solid #EAE5DE; border-right: 1px solid #EAE5DE; border-bottom: 1px solid #EAE5DE;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding-bottom: 10px; font-size: 12px; color: #888888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Sender Details</td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 6px; font-size: 15px; color: #16171A;">
                              <strong style="color: #6B4A34;">Name:</strong> ${senderName}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 6px; font-size: 15px; color: #16171A;">
                              <strong style="color: #6B4A34;">Email:</strong> <a href="mailto:${senderEmail}" style="color: #6B4A34; font-weight: bold; text-decoration: underline;">${senderEmail}</a>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: #777777;">
                              <strong style="color: #6B4A34;">Received:</strong> ${formattedDate}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- MESSAGE HEADING -->
                  <h3 style="font-family: Georgia, serif; font-size: 16px; color: #16171A; margin: 0 0 12px 0;">Message Content:</h3>

                  <!-- MESSAGE BODY -->
                  <div style="background-color: #FAF8F5; border: 1px solid #EAE5DE; border-radius: 12px; padding: 20px; font-size: 14px; line-height: 1.7; color: #2C2825; white-space: pre-wrap; margin-bottom: 28px;">${message}</div>

                  <!-- DIRECT REPLY BUTTON -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="mailto:${senderEmail}" style="display: inline-block; background-color: #6B4A34; color: #FFFFFF; font-size: 13px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(107, 74, 52, 0.25);">
                          ✉ Reply Directly to ${senderName}
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background-color: #FAF8F5; padding: 20px 30px; text-align: center; border-top: 1px solid #EAE4D9;">
                  <p style="margin: 0; font-size: 12px; color: #888888;">
                    ♔ <strong>Jumuiya Chess Initiative</strong> • Empowering Communities Through Chess
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #AAAAAA;">
                    Sent automatically from the Jumuiya Chess Contact Page
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Default recipient: iykekonzolaw21@gmail.com
  let recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'iykekonzolaw21@gmail.com';
  try {
    const { data } = await supabase.from('site_settings').select('org_email').single();
    if (data && data.org_email) {
      recipientEmail = data.org_email;
    }
  } catch (err) {
    // fallback
  }

  if (nodemailerTransporter) {
    try {
      await nodemailerTransporter.sendMail({
        from: `"${senderName} via Jumuiya Chess" <${smtpUser}>`,
        replyTo: senderEmail,
        to: recipientEmail,
        subject,
        html,
      });
      console.log(`[SMTP Email] Contact notification sent to admin inbox: ${recipientEmail}`);
      return;
    } catch (err) {
      console.error('[SMTP Error] Failed sending contact email:', err);
    }
  }

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


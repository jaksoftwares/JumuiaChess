import { Resend } from 'resend';
import { supabaseAdmin } from './supabase/admin';
// import nodemailer from 'nodemailer'; // Nodemailer requires 'net' which is sometimes problematic on Edge runtime depending on NextJS config. We'll stick to Resend.

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Jumuiya Chess <info@jumuiyachess.org>';
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
        from: RESEND_FROM_EMAIL,
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
        from: RESEND_FROM_EMAIL,
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

export const sendDonationReceipt = async (
  email: string,
  details: { donorName: string; amount: number; receipt: string }
): Promise<void> => {
  const subject = `Thank You for Your Donation! Receipt: ${details.receipt}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6B4A34;">Jumuiya Chess</h2>
      <p>Hello ${details.donorName || 'Awesome Supporter'},</p>
      <p>Thank you so much for your generous donation of <strong>KES ${details.amount.toLocaleString()}</strong>.</p>
      <p>Your contribution directly supports our mission to empower communities through chess!</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p><strong>Transaction Details:</strong></p>
      <ul>
        <li><strong>Amount:</strong> KES ${details.amount.toLocaleString()}</li>
        <li><strong>M-Pesa Receipt:</strong> ${details.receipt}</li>
      </ul>
      <p style="font-size: 0.8em; color: #888; margin-top: 40px;">This is an automated receipt from Jumuiya Chess.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: email,
        subject,
        html,
      });
      console.log(`[Resend] Donation receipt sent to ${email}`);
      return;
    } catch (error) {
      console.error('[Resend Error] Failed to send donation receipt:', error);
    }
  }
  console.log(`[EMAIL MOCK] Donation receipt to ${email}`);
};

export const notifyAdminOfDonation = async (
  details: { donorName: string; amount: number; receipt: string; message: string }
): Promise<void> => {
  let recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'iykekonzolaw21@gmail.com';
  try {
    const { data } = await supabaseAdmin.from('site_settings').select('org_email').single();
    if (data && data.org_email) {
      recipientEmail = data.org_email;
    }
  } catch (err) { }

  const subject = `🎉 New Donation Received: KES ${details.amount}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #6B4A34;">New Donation Alert</h2>
      <p><strong>Donor:</strong> ${details.donorName || 'Anonymous'}</p>
      <p><strong>Amount:</strong> KES ${details.amount.toLocaleString()}</p>
      <p><strong>Receipt:</strong> ${details.receipt}</p>
      ${details.message ? `<p><strong>Message:</strong> <em>"${details.message}"</em></p>` : ''}
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: recipientEmail,
        subject,
        html,
      });
      return;
    } catch (error) {
      console.error('[Resend Error] Failed to notify admin of donation:', error);
    }
  }
  console.log(`[EMAIL MOCK] Admin notified of donation: ${details.receipt}`);
};

export const sendOrderReceipt = async (
  email: string,
  details: { customerName: string; amount: number; receipt: string; items: any[], address: string }
): Promise<void> => {
  const subject = `Order Confirmed: ${details.receipt}`;
  const itemsHtml = details.items.map(item => `<li>${item.quantity}x ${item.name} - KES ${item.price}</li>`).join('');
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6B4A34;">Jumuiya Chess Store</h2>
      <p>Hello ${details.customerName},</p>
      <p>Thank you for your purchase of <strong>KES ${details.amount.toLocaleString()}</strong>.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p><strong>Order Items:</strong></p>
      <ul>${itemsHtml}</ul>
      <p><strong>Shipping To:</strong> ${details.address}</p>
      <p><strong>M-Pesa Receipt:</strong> ${details.receipt}</p>
      <p style="font-size: 0.8em; color: #888; margin-top: 40px;">This is an automated receipt from Jumuiya Chess.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({ from: RESEND_FROM_EMAIL, to: email, subject, html });
      console.log(`[Resend] Order receipt sent to ${email}`);
      return;
    } catch (error) {
      console.error('[Resend Error] Failed to send order receipt:', error);
    }
  }
  console.log(`[EMAIL MOCK] Order receipt to ${email}`);
};

export const notifyAdminOfOrder = async (
  details: { customerName: string; amount: number; receipt: string; items: any[], address: string, email: string, phone: string }
): Promise<void> => {
  let recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'iykekonzolaw21@gmail.com';
  try {
    const { data } = await supabaseAdmin.from('site_settings').select('org_email').single();
    if (data && data.org_email) recipientEmail = data.org_email;
  } catch (err) { }

  const subject = `📦 New Store Order: KES ${details.amount}`;
  const itemsHtml = details.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #6B4A34;">New Store Order</h2>
      <p><strong>Customer:</strong> ${details.customerName} (${details.email} | ${details.phone})</p>
      <p><strong>Amount:</strong> KES ${details.amount.toLocaleString()}</p>
      <p><strong>Receipt:</strong> ${details.receipt}</p>
      <p><strong>Shipping Address:</strong> ${details.address}</p>
      <p><strong>Items:</strong></p>
      <ul>${itemsHtml}</ul>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({ from: RESEND_FROM_EMAIL, to: recipientEmail, subject, html });
      return;
    } catch (error) {
      console.error('[Resend Error] Failed to notify admin of order:', error);
    }
  }
  console.log(`[EMAIL MOCK] Admin notified of order: ${details.receipt}`);
};

export const sendOrderShippedNotification = async (
  email: string,
  details: { customerName: string; receipt: string; deliveryNotes?: string }
): Promise<void> => {
  const subject = `Your Order Has Shipped! 🚀 (${details.receipt})`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6B4A34;">Great News, ${details.customerName}!</h2>
      <p>Your Jumuiya Chess order <strong>(${details.receipt})</strong> has been marked as shipped and is currently on its way to you.</p>
      ${details.deliveryNotes ? `<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" /><p><strong>Tracking / Delivery Notes:</strong></p><p style="padding: 10px; background-color: #FAF7F2; border-radius: 4px;">${details.deliveryNotes}</p>` : ''}
      <p style="margin-top: 20px;">If you have any questions, feel free to reply to this email.</p>
      <p>Thank you for supporting our mission!</p>
      <p style="font-size: 0.8em; color: #888; margin-top: 40px;">This is an automated notification from Jumuiya Chess.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({ from: RESEND_FROM_EMAIL, to: email, subject, html });
      console.log(`[Resend] Order shipped notification sent to ${email}`);
      return;
    } catch (error) {
      console.error('[Resend Error] Failed to send order shipped notification:', error);
    }
  }
  console.log(`[EMAIL MOCK] Order shipped notification to ${email}`);
};

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
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; color: #111827;">
      <h1 style="color: #6B4A34; margin-top: 0;">Jumuiya Chess</h1>
      <p style="color: #4b5563; font-size: 14px;">Official Donation Receipt</p>
      
      <p>Hello <strong>${details.donorName || 'Awesome Supporter'}</strong>,</p>
      <p>Thank you so much for your generous donation! Your contribution directly supports our mission to empower communities through chess.</p>
      
      <table style="width: 100%; margin: 30px 0; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td style="padding: 10px; border-bottom: 1px solid #eee;">General Donation (M-Pesa STK)</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${details.amount.toLocaleString()}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 10px; text-align: right; font-weight: bold;">Total Contribution</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #6B4A34;">KES ${details.amount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; font-size: 14px;">
        <p style="margin: 0 0 5px 0;"><strong>Donation Reference:</strong> ${details.receipt}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated receipt from Jumuiya Chess. If you have any questions, please contact us at info@jumuiyachess.org.
      </p>
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
  
  const itemsHtml = details.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; color: #111827;">
      <h1 style="color: #6B4A34; margin-top: 0;">Jumuiya Chess</h1>
      <p style="color: #4b5563; font-size: 14px;">Official Store Receipt</p>
      
      <p>Hello <strong>${details.customerName}</strong>,</p>
      <p>Thank you for shopping with us! Your order has been confirmed and is being processed.</p>
      
      <table style="width: 100%; margin: 30px 0; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Paid</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #6B4A34;">KES ${details.amount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; font-size: 14px;">
        <p style="margin: 0 0 5px 0;"><strong>Order Reference:</strong> ${details.receipt}</p>
        <p style="margin: 0;"><strong>Shipping To:</strong> ${details.address}</p>
      </div>

      <p style="font-size: 14px; margin-top: 30px;">
        You will receive another email as soon as your order has been shipped. 
      </p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated receipt from Jumuiya Chess. If you have any questions, please contact us at info@jumuiyachess.org.
      </p>
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

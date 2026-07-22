import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendContactNotification } from '../services/email.service';

// POST /api/contact
export const submitContactMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required fields' });
    }

    // 1. Insert message into Supabase contact_messages table
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message }])
      .select()
      .single();

    if (error) throw error;

    // 2. Dispatch email to administrators via Resend
    await sendContactNotification(name, email, message);

    res.status(201).json({
      success: true,
      message: 'Message submitted successfully. Administrators have been notified.',
      data
    });
  } catch (err) {
    next(err);
  }
};

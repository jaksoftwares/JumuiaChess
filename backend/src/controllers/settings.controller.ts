import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// GET /api/settings (Admin only)
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings (Admin only)
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { org_email, org_phone, mpesa_paybill, instagram_url, facebook_url, youtube_url, shop_enabled } = req.body;
    
    const { data, error } = await supabase
      .from('site_settings')
      .update({
        org_email,
        org_phone,
        mpesa_paybill,
        instagram_url,
        facebook_url,
        youtube_url,
        shop_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

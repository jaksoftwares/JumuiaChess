import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import cache from '../utils/cache';

const TTL = 120_000; // 2 minutes — settings change very infrequently

// GET /api/settings
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any>('settings:1');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    if (data) cache.set('settings:1', data, TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('settings:1');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

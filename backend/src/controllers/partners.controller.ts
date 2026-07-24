import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import cache from '../utils/cache';

const TTL = 60_000;

// GET /api/partners
export const getPartners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any[]>('partners:all');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    cache.set('partners:all', data || [], TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/partners
export const addPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, logo_url, website_url } = req.body;
    const { data, error } = await supabase
      .from('partners')
      .insert([{ name, logo_url, website_url }])
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('partners:all');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/partners/:id
export const deletePartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) throw error;
    cache.invalidate('partners:all');
    res.json({ success: true, message: 'Partner deleted successfully' });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import cache from '../utils/cache';

const TTL = 60_000; // 60 seconds

// GET /api/gallery
export const getGallery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const cacheKey = `gallery:${category ?? 'all'}`;

    const cached = cache.get<any[]>(cacheKey);
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    let query = supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) {
      if (error.code === '42P01') return res.json({ success: true, data: [] });
      throw error;
    }

    cache.set(cacheKey, data || [], TTL);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/gallery
export const addGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image_url, caption, category } = req.body;
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([{ image_url, caption, category }])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        return res.status(400).json({
          success: false,
          error: 'Table "gallery_images" does not exist in Supabase database yet.',
        });
      }
      throw error;
    }
    cache.invalidatePrefix('gallery:');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/gallery/:id
export const deleteGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) throw error;
    cache.invalidatePrefix('gallery:');
    res.json({ success: true, message: 'Gallery image deleted successfully' });
  } catch (err) {
    next(err);
  }
};

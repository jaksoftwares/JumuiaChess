import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// GET /api/gallery
export const getGallery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    let query = supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
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

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/gallery/:id
export const deleteGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Gallery image deleted successfully' });
  } catch (err) {
    next(err);
  }
};

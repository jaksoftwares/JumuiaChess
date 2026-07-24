import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import cache from '../utils/cache';

const TTL = 60_000; // 60 seconds

// GET /api/blog (Public: Published only)
export const getPublishedPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any[]>('blog:published');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    cache.set('blog:published', data || [], TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/blog/all (Admin: All posts including drafts)
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any[]>('blog:all');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    cache.set('blog:all', data || [], TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/blog
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, slug, featured_image_url, excerpt, body, published } = req.body;
    const publishedAt = published ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ title, slug, featured_image_url, excerpt, body, published, published_at: publishedAt }])
      .select()
      .single();

    if (error) throw error;
    cache.invalidatePrefix('blog:');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/blog/:id
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, slug, featured_image_url, excerpt, body, published } = req.body;

    let updateFields: any = { title, slug, featured_image_url, excerpt, body, published };
    if (published !== undefined) {
      updateFields.published_at = published ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    cache.invalidatePrefix('blog:');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blog/:id
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    cache.invalidatePrefix('blog:');
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

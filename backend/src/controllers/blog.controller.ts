import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// GET /api/blog (Public: Published posts only)
export const getPublishedPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/blog/all (Admin: All posts, including drafts)
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/blog (Admin only)
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
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/blog/:id (Admin only)
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, slug, featured_image_url, excerpt, body, published } = req.body;
    
    // Determine published_at value changes
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
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blog/:id (Admin only)
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

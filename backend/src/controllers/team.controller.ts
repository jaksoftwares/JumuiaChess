import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import cache from '../utils/cache';

const TTL = 60_000; // 60 seconds

// GET /api/team
export const getTeamMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any[]>('team:all');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('[Supabase] "team_members" table does not exist yet.');
        return res.json({ success: true, data: [] });
      }
      throw error;
    }

    cache.set('team:all', data || [], TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/team
export const addTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, role, bio, image_url, sort_order } = req.body;
    const { data, error } = await supabase
      .from('team_members')
      .insert([{ name, role, bio, image_url, sort_order: sort_order ? Number(sort_order) : 0 }])
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('team:all');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/team/:id
export const updateTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, role, bio, image_url, sort_order } = req.body;
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name,
        role,
        bio,
        image_url,
        sort_order: sort_order !== undefined ? Number(sort_order) : undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('team:all');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/team/:id
export const deleteTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
    cache.invalidate('team:all');
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (err) {
    next(err);
  }
};
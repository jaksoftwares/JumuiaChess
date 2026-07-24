import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import cache from '../utils/cache';

const TTL = 60_000;

// GET /api/tournaments
export const getTournaments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any[]>('tournaments:all');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    cache.set('tournaments:all', data || [], TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/tournaments
export const createTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, poster_url, event_date, venue, categories, entry_fee, description, status } = req.body;
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{ name, poster_url, event_date, venue, categories, entry_fee, description, status }])
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('tournaments:all');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tournaments/:id
export const updateTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, poster_url, event_date, venue, categories, entry_fee, description, status } = req.body;
    const { data, error } = await supabase
      .from('tournaments')
      .update({ name, poster_url, event_date, venue, categories, entry_fee, description, status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('tournaments:all');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tournaments/:id
export const deleteTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (error) throw error;
    cache.invalidate('tournaments:all');
    res.json({ success: true, message: 'Tournament deleted successfully' });
  } catch (err) {
    next(err);
  }
};

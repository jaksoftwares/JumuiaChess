import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// GET /api/registrations (Admin only)
export const getRegistrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId, status } = req.query;
    let query = supabase
      .from('registrations')
      .select('*, tournaments(name)')
      .order('created_at', { ascending: false });

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }
    if (status) {
      query = query.eq('payment_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

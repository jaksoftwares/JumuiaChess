import { Router } from 'express';
import { getTournaments, createTournament, updateTournament, deleteTournament } from '../controllers/tournaments.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getTournaments);
router.post('/', requireAdmin, createTournament);
router.put('/:id', requireAdmin, updateTournament);
router.delete('/:id', requireAdmin, deleteTournament);

export default router;

import { Router } from 'express';
import { getRegistrations, clearRegistrations } from '../controllers/registrations.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAdmin, getRegistrations);
router.delete('/clear', requireAdmin, clearRegistrations);

export default router;

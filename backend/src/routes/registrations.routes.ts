import { Router } from 'express';
import { getRegistrations } from '../controllers/registrations.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAdmin, getRegistrations);

export default router;

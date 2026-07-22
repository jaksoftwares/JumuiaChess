import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAdmin, getSettings);
router.put('/', requireAdmin, updateSettings);

export default router;

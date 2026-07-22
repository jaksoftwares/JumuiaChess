import { Router } from 'express';
import { getPartners, addPartner, deletePartner } from '../controllers/partners.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPartners);
router.post('/', requireAdmin, addPartner);
router.delete('/:id', requireAdmin, deletePartner);

export default router;

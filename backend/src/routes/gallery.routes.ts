import { Router } from 'express';
import { getGallery, addGalleryImage, deleteGalleryImage } from '../controllers/gallery.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getGallery);
router.post('/', requireAdmin, addGalleryImage);
router.delete('/:id', requireAdmin, deleteGalleryImage);

export default router;

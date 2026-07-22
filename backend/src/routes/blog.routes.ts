import { Router } from 'express';
import { getPublishedPosts, getAllPosts, createPost, updatePost, deletePost } from '../controllers/blog.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPublishedPosts);
router.get('/all', requireAdmin, getAllPosts);
router.post('/', requireAdmin, createPost);
router.put('/:id', requireAdmin, updatePost);
router.delete('/:id', requireAdmin, deletePost);

export default router;

import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, checkout, getOrders } from '../controllers/shop.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/products', getProducts);
router.post('/products', requireAdmin, createProduct);
router.put('/products/:id', requireAdmin, updateProduct);
router.delete('/products/:id', requireAdmin, deleteProduct);
router.post('/checkout', checkout);
router.get('/orders', requireAdmin, getOrders);

export default router;

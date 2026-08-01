import { Router } from 'express';
import { registerWithMpesa, mpesaCallback, getMpesaPaymentStatus } from '../controllers/mpesa.controller';

const router = Router();

router.post('/register', registerWithMpesa);
router.post('/callback', mpesaCallback);
router.get('/status/:checkoutRequestId', getMpesaPaymentStatus);

export default router;

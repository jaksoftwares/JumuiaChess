import { Router } from 'express';
import { registerWithMpesa, mpesaCallback } from '../controllers/mpesa.controller';

const router = Router();

router.post('/register', registerWithMpesa);
router.post('/callback', mpesaCallback);

export default router;

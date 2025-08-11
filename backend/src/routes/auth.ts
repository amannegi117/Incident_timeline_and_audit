import { Router } from 'express';
import { login } from '../controllers/authController';
import { authRateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/login', authRateLimit, login);

export default router;

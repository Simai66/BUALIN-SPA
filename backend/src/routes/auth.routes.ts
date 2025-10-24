import { Router } from 'express';
import { register, verifyEmail, login, logout, getMe } from '../controllers/auth.controller';
import { authGuard } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { validateBody, registerSchema, loginSchema } from '../utils/validate';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.get('/verify', verifyEmail);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authGuard, getMe);

export default router;

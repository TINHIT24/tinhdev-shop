import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes (Requires Bearer token)
router.get('/me', authenticate, getProfile);

export default router;

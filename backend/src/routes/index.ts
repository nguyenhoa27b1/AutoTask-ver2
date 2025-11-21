import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin';
import userRoutes from './user';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/admin', adminRoutes);
router.use('/user', authenticate, userRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

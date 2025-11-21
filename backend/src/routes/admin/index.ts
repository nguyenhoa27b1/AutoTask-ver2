import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import taskRoutes from './task.routes';
import userRoutes from './user.routes';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// Mount sub-routes
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;

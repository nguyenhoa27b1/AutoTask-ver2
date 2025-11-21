import { Router } from 'express';
import {
  getUserTasks,
  getTaskById,
  getUserProfile,
} from '../../controllers/user/task.controller';
import { param } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

// GET /api/user/tasks - Get user's tasks
router.get('/tasks', getUserTasks);

// GET /api/user/tasks/:taskId - Get task by ID
router.get(
  '/tasks/:taskId',
  validate([
    param('taskId').isUUID().withMessage('Invalid task ID'),
  ]),
  getTaskById
);

// GET /api/user/profile/score - Get user profile and statistics
router.get('/profile/score', getUserProfile);

export default router;

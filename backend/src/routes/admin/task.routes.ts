import { Router } from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  completeTask,
  resetTaskScore,
  deleteTask,
} from '../../controllers/admin/task.controller';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// POST /api/admin/tasks - Create task
router.post(
  '/',
  upload.array('files', 5), // Max 5 files
  validate([
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('description').optional().trim(),
    body('assignedUserId').notEmpty().withMessage('Assigned user ID is required').isUUID().withMessage('Invalid user ID'),
    body('deadline').notEmpty().withMessage('Deadline is required').isISO8601().withMessage('Invalid date format'),
  ]),
  createTask
);

// GET /api/admin/tasks - Get all tasks
router.get('/', getAllTasks);

// GET /api/admin/tasks/:taskId - Get task by ID
router.get(
  '/:taskId',
  validate([
    param('taskId').isUUID().withMessage('Invalid task ID'),
  ]),
  getTaskById
);

// PUT /api/admin/tasks/:taskId/complete - Complete task and assign score
router.put(
  '/:taskId/complete',
  validate([
    param('taskId').isUUID().withMessage('Invalid task ID'),
    body('score').notEmpty().withMessage('Score is required').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  ]),
  completeTask
);

// PUT /api/admin/tasks/:taskId/reset-score - Reset task score
router.put(
  '/:taskId/reset-score',
  validate([
    param('taskId').isUUID().withMessage('Invalid task ID'),
  ]),
  resetTaskScore
);

// DELETE /api/admin/tasks/:taskId - Delete task
router.delete(
  '/:taskId',
  validate([
    param('taskId').isUUID().withMessage('Invalid task ID'),
  ]),
  deleteTask
);

export default router;

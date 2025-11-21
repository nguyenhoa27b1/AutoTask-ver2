import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  deactivateUser,
  exportUsersToExcel,
} from '../../controllers/admin/user.controller';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

// GET /api/admin/users - Get all users
router.get('/', getAllUsers);

// POST /api/admin/users - Create user
router.post(
  '/',
  validate([
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('name').optional().trim(),
    body('googleId').notEmpty().withMessage('Google ID is required'),
  ]),
  createUser
);

// DELETE /api/admin/users/:userId - Deactivate user
router.delete(
  '/:userId',
  validate([
    param('userId').isUUID().withMessage('Invalid user ID'),
  ]),
  deactivateUser
);

// GET /api/admin/users/export - Export users to Excel
router.get('/export', exportUsersToExcel);

export default router;

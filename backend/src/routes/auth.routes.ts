import { Router } from 'express';
import { googleLogin } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

// POST /api/auth/google - Google OAuth login
router.post(
  '/google',
  validate([
    body('idToken').notEmpty().withMessage('Google ID token is required'),
  ]),
  googleLogin
);

export default router;

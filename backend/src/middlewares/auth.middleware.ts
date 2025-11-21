import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errorHandler';
import prisma from '../config/database';
import { UserPayload } from '../types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive. Please contact admin', 403);
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

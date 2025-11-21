import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: err.message,
    };
    return res.status(err.statusCode).json(response);
  }

  // Unhandled errors
  console.error('ERROR 💥:', err);
  const response: ApiResponse = {
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  };
  return res.status(500).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

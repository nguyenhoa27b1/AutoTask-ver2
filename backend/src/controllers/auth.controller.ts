import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { asyncHandler } from '../utils/errorHandler';
import { ApiResponse } from '../types';

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'Google ID token is required',
    } as ApiResponse);
  }

  const result = await authService.googleLogin(idToken);

  // If user needs approval
  if ('needsApproval' in result) {
    return res.status(200).json({
      success: true,
      message: result.message,
      data: { needsApproval: true },
    } as ApiResponse);
  }

  // Successful login
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  } as ApiResponse);
});

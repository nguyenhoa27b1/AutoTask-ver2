import { Request, Response } from 'express';
import taskService from '../../services/task.service';
import userService from '../../services/user.service';
import { asyncHandler } from '../../utils/errorHandler';
import { ApiResponse, PaginatedResponse } from '../../types';

// Get user's tasks
export const getUserTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;

  const result = await taskService.getUserTasks(userId, page, limit);

  return res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: result.tasks,
    pagination: result.pagination,
  } as PaginatedResponse<any>);
});

// Get task by ID (user can only view their own tasks)
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { taskId } = req.params;

  const task = await taskService.getTaskById(taskId, userId, false);

  return res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  } as ApiResponse);
});

// Get user profile and statistics
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const profile = await userService.getUserProfile(userId);

  return res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: profile,
  } as ApiResponse);
});

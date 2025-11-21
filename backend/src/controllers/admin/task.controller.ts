import { Request, Response } from 'express';
import taskService from '../../services/task.service';
import { asyncHandler } from '../../utils/errorHandler';
import { ApiResponse, PaginatedResponse } from '../../types';

// Create task
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const taskData = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  const task = await taskService.createTask(adminId, taskData, files);

  return res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  } as ApiResponse);
});

// Get all tasks
export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const status = req.query.status as string | undefined;
  const assignedUserId = req.query.assignedUserId as string | undefined;

  const result = await taskService.getAllTasks(page, limit, { status, assignedUserId });

  return res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: result.tasks,
    pagination: result.pagination,
  } as PaginatedResponse<any>);
});

// Get task by ID
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const task = await taskService.getTaskById(taskId, undefined, true);

  return res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  } as ApiResponse);
});

// Complete task and assign score
export const completeTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { score } = req.body;

  const task = await taskService.completeTask(taskId, { score });

  return res.status(200).json({
    success: true,
    message: 'Task completed and scored successfully',
    data: task,
  } as ApiResponse);
});

// Reset task score
export const resetTaskScore = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const result = await taskService.resetTaskScore(taskId);

  return res.status(200).json({
    success: true,
    message: result.message,
  } as ApiResponse);
});

// Delete task
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const result = await taskService.deleteTask(taskId);

  return res.status(200).json({
    success: true,
    message: result.message,
  } as ApiResponse);
});

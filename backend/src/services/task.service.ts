import prisma from '../config/database';
import { AppError } from '../utils/errorHandler';
import { CreateTaskDto, CompleteTaskDto } from '../types';
import emailService from './email.service';

class TaskService {
  // Create new task
  async createTask(adminId: string, data: CreateTaskDto, files?: Express.Multer.File[]) {
    // Verify assigned user exists and is active
    const assignedUser = await prisma.user.findUnique({
      where: { id: data.assignedUserId },
    });

    if (!assignedUser || !assignedUser.isActive) {
      throw new AppError('Assigned user not found or inactive', 404);
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        adminId,
        assignedUserId: data.assignedUserId,
        deadline: new Date(data.deadline),
        status: 'PENDING',
      },
      include: {
        assignedUser: {
          select: { email: true, name: true },
        },
      },
    });

    // Handle file uploads
    if (files && files.length > 0) {
      const fileRecords = files.map(file => ({
        taskId: task.id,
        fileUrl: file.path,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      }));

      await prisma.taskFile.createMany({
        data: fileRecords,
      });
    }

    // Send email notification
    try {
      await emailService.sendTaskCreatedEmail(
        task.assignedUser.email,
        task.assignedUser.name || task.assignedUser.email,
        task.title,
        task.deadline
      );
    } catch (error) {
      console.error('Failed to send task created email:', error);
    }

    return task;
  }

  // Get all tasks (admin view)
  async getAllTasks(page: number = 1, limit: number = 15, filters?: any) {
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.assignedUserId) {
      where.assignedUserId = filters.assignedUserId;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedUser: {
            select: { id: true, email: true, name: true },
          },
          admin: {
            select: { id: true, email: true, name: true },
          },
          files: true,
        },
        orderBy: [
          { status: 'asc' }, // OVERDUE first (alphabetically), then PENDING, then COMPLETED
          { deadline: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    // Custom sort: OVERDUE -> PENDING -> COMPLETED
    const sortedTasks = tasks.sort((a, b) => {
      const statusOrder = { OVERDUE: 0, PENDING: 1, COMPLETED: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return {
      tasks: sortedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user's tasks
  async getUserTasks(userId: string, page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: {
          assignedUserId: userId,
          isDeleted: false,
        },
        include: {
          admin: {
            select: { email: true, name: true },
          },
          files: true,
        },
        orderBy: [
          { status: 'asc' },
          { deadline: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.task.count({
        where: {
          assignedUserId: userId,
          isDeleted: false,
        },
      }),
    ]);

    // Custom sort: OVERDUE -> PENDING -> COMPLETED
    const sortedTasks = tasks.sort((a, b) => {
      const statusOrder = { OVERDUE: 0, PENDING: 1, COMPLETED: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return {
      tasks: sortedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get task by ID
  async getTaskById(taskId: string, userId?: string, isAdmin: boolean = false) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedUser: {
          select: { id: true, email: true, name: true, avatar: true },
        },
        admin: {
          select: { id: true, email: true, name: true },
        },
        files: true,
      },
    });

    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    // Check permissions
    if (!isAdmin && userId && task.assignedUserId !== userId) {
      throw new AppError('You do not have permission to view this task', 403);
    }

    return task;
  }

  // Complete task and assign score (Admin only)
  async completeTask(taskId: string, data: CompleteTaskDto) {
    // Validate score
    if (data.score < 0 || data.score > 100) {
      throw new AppError('Score must be between 0 and 100', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedUser: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    if (task.status === 'COMPLETED') {
      throw new AppError('Task is already completed', 400);
    }

    const completedAt = new Date();
    const isOnTime = completedAt <= task.deadline;

    // Use transaction to ensure data consistency
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update task
      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          score: data.score,
          completedAt,
        },
      });

      // Update user statistics
      const userUpdate: any = {
        score: { increment: data.score },
      };

      if (isOnTime) {
        userUpdate.completedOnTimeCount = { increment: 1 };
      } else {
        userUpdate.completedLateCount = { increment: 1 };
      }

      await tx.user.update({
        where: { id: task.assignedUserId },
        data: userUpdate,
      });

      return updated;
    });

    // Send email notification
    try {
      await emailService.sendTaskCompletedEmail(
        task.assignedUser.email,
        task.assignedUser.name || task.assignedUser.email,
        task.title,
        data.score
      );
    } catch (error) {
      console.error('Failed to send task completed email:', error);
    }

    return updatedTask;
  }

  // Reset task score (Admin only)
  async resetTaskScore(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    if (task.status !== 'COMPLETED') {
      throw new AppError('Can only reset score for completed tasks', 400);
    }

    // Use transaction to rollback user statistics
    await prisma.$transaction(async (tx) => {
      const oldScore = task.score || 0;
      const completedAt = task.completedAt!;
      const isOnTime = completedAt <= task.deadline;

      // Revert user statistics
      const userUpdate: any = {
        score: { decrement: oldScore },
      };

      if (isOnTime) {
        userUpdate.completedOnTimeCount = { decrement: 1 };
      } else {
        userUpdate.completedLateCount = { decrement: 1 };
      }

      await tx.user.update({
        where: { id: task.assignedUserId },
        data: userUpdate,
      });

      // Reset task
      await tx.task.update({
        where: { id: taskId },
        data: {
          score: null,
          status: 'PENDING',
          completedAt: null,
        },
      });
    });

    return { message: 'Task score reset successfully' };
  }

  // Delete task (soft delete, Admin only)
  async deleteTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedUser: {
          select: { email: true, name: true },
        },
      },
    });

    if (!task || task.isDeleted) {
      throw new AppError('Task not found', 404);
    }

    if (task.status === 'COMPLETED') {
      throw new AppError('Cannot delete completed tasks', 400);
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { isDeleted: true },
    });

    // Send email notification
    try {
      await emailService.sendTaskDeletedEmail(
        task.assignedUser.email,
        task.assignedUser.name || task.assignedUser.email,
        task.title
      );
    } catch (error) {
      console.error('Failed to send task deleted email:', error);
    }

    return { message: 'Task deleted successfully' };
  }

  // Update overdue tasks (called by cron job)
  async updateOverdueTasks() {
    const now = new Date();

    const result = await prisma.task.updateMany({
      where: {
        status: 'PENDING',
        deadline: { lt: now },
        isDeleted: false,
      },
      data: {
        status: 'OVERDUE',
      },
    });

    console.log(`✅ Updated ${result.count} tasks to OVERDUE status`);
    return result.count;
  }

  // Get tasks with upcoming deadlines (for email reminders)
  async getTasksWithUpcomingDeadlines() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        status: 'PENDING',
        deadline: {
          gte: now,
          lte: tomorrow,
        },
        isDeleted: false,
      },
      include: {
        assignedUser: {
          select: { email: true, name: true },
        },
      },
    });

    return tasks;
  }
}

export default new TaskService();

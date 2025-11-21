import prisma from '../config/database';
import { AppError } from '../utils/errorHandler';
import { CreateUserDto } from '../types';

class UserService {
  // Get all users (for admin)
  async getAllUsers(page: number = 1, limit: number = 15, sortBy: string = 'score') {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          score: true,
          completedOnTimeCount: true,
          completedLateCount: true,
          incompleteCount: true,
          createdAt: true,
        },
        orderBy: sortBy === 'score' ? { score: 'desc' } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create user
  async createUser(data: CreateUserDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        googleId: data.googleId,
        isActive: true,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return user;
  }

  // Deactivate user (soft delete)
  async deactivateUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot deactivate admin users', 403);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  // Get user profile with statistics
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        score: true,
        completedOnTimeCount: true,
        completedLateCount: true,
        incompleteCount: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Update user statistics (used internally)
  async updateUserStatistics(
    userId: string,
    updates: {
      scoreIncrement?: number;
      completedOnTime?: boolean;
      completedLate?: boolean;
      incomplete?: boolean;
    }
  ) {
    const updateData: any = {};

    if (updates.scoreIncrement) {
      updateData.score = { increment: updates.scoreIncrement };
    }

    if (updates.completedOnTime) {
      updateData.completedOnTimeCount = { increment: 1 };
    }

    if (updates.completedLate) {
      updateData.completedLateCount = { increment: 1 };
    }

    if (updates.incomplete) {
      updateData.incompleteCount = { increment: 1 };
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}

export default new UserService();

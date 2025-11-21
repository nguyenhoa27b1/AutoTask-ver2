import { Request, Response } from 'express';
import userService from '../../services/user.service';
import { asyncHandler } from '../../utils/errorHandler';
import { ApiResponse, PaginatedResponse } from '../../types';
import ExcelJS from 'exceljs';
import prisma from '../../config/database';

// Get all users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const sortBy = req.query.sortBy as string || 'score';

  const result = await userService.getAllUsers(page, limit, sortBy);

  return res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result.users,
    pagination: result.pagination,
  } as PaginatedResponse<any>);
});

// Create user
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, googleId } = req.body;

  const user = await userService.createUser({ email, name, googleId });

  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  } as ApiResponse);
});

// Deactivate user
export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await userService.deactivateUser(userId);

  return res.status(200).json({
    success: true,
    message: result.message,
  } as ApiResponse);
});

// Export users to Excel
export const exportUsersToExcel = asyncHandler(async (_req: Request, res: Response) => {
  // Get all users with statistics
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      email: true,
      name: true,
      role: true,
      score: true,
      completedOnTimeCount: true,
      completedLateCount: true,
      incompleteCount: true,
      createdAt: true,
    },
    orderBy: { score: 'desc' },
  });

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users Report');

  // Define columns
  worksheet.columns = [
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Tên', key: 'name', width: 25 },
    { header: 'Vai trò', key: 'role', width: 10 },
    { header: 'Điểm tổng', key: 'score', width: 12 },
    { header: 'Hoàn thành đúng hạn', key: 'completedOnTimeCount', width: 20 },
    { header: 'Hoàn thành trễ', key: 'completedLateCount', width: 18 },
    { header: 'Chưa hoàn thành', key: 'incompleteCount', width: 18 },
    { header: 'Ngày tạo', key: 'createdAt', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4CAF50' },
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data rows
  users.forEach(user => {
    worksheet.addRow({
      email: user.email,
      name: user.name || 'N/A',
      role: user.role === 'ADMIN' ? 'Admin' : 'User',
      score: user.score,
      completedOnTimeCount: user.completedOnTimeCount,
      completedLateCount: user.completedLateCount,
      incompleteCount: user.incompleteCount,
      createdAt: user.createdAt.toLocaleDateString('vi-VN'),
    });
  });

  // Add conditional formatting for scores
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const scoreCell = row.getCell(4);
      const score = scoreCell.value as number;
      
      if (score >= 80) {
        scoreCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F5E9' }, // Light green
        };
      } else if (score >= 50) {
        scoreCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3E0' }, // Light orange
        };
      } else {
        scoreCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEBEE' }, // Light red
        };
      }
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=users-report-${Date.now()}.xlsx`);

  return res.send(buffer);
});

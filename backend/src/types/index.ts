export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignedUserId: string;
  deadline: Date;
}

export interface CompleteTaskDto {
  score: number;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  googleId: string;
}

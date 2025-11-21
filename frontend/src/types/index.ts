// User types
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  score: number;
  completedOnTimeCount: number;
  completedLateCount: number;
  incompleteCount: number;
  isActive: boolean;
  createdAt: string;
}

// Task types
export enum TaskStatus {
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED',
}

export interface TaskFile {
  id: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  status: TaskStatus;
  score: number | null;
  completedAt: string | null;
  createdAt: string;
  admin: {
    id: string;
    name: string | null;
    email: string;
  };
  assignedUser: {
    id: string;
    name: string | null;
    email: string;
    avatar?: string | null;
    score?: number;
  };
  files: TaskFile[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginResponse {
  token: string;
  user: User;
}

// Form types
export interface CreateTaskForm {
  title: string;
  description: string;
  assignedUserId: string;
  deadline: string;
  files?: File[];
}

export interface CompleteTaskForm {
  score: number;
}

export interface CreateUserForm {
  email: string;
  name: string;
  googleId?: string;
  role?: 'USER' | 'ADMIN';
}

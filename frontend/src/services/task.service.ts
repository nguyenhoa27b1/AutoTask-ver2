import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { ApiResponse, Task, PaginatedResponse, CreateTaskForm } from '../types';

export const taskService = {
  // Admin endpoints
  async getAllTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assignedUserId?: string;
    search?: string;
  }): Promise<PaginatedResponse<Task>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>(
      API_ENDPOINTS.ADMIN.TASKS,
      { params }
    );
    return response.data.data!;
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(
      API_ENDPOINTS.ADMIN.TASK_BY_ID(id)
    );
    return response.data.data!;
  },

  async createTask(data: CreateTaskForm, files?: FileList): Promise<Task> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('assignedUserId', data.assignedUserId);
    formData.append('deadline', data.deadline);
    
    if (files) {
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<ApiResponse<Task>>(
      API_ENDPOINTS.ADMIN.TASKS,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  async completeTask(id: string, score: number): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(
      API_ENDPOINTS.ADMIN.COMPLETE_TASK(id),
      { score }
    );
    return response.data.data!;
  },

  async resetScore(id: string): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(
      API_ENDPOINTS.ADMIN.RESET_SCORE(id)
    );
    return response.data.data!;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.ADMIN.DELETE_TASK(id));
  },

  // User endpoints
  async getMyTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Task>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>(
      API_ENDPOINTS.USER.TASKS,
      { params }
    );
    return response.data.data!;
  },

  async getUserTasks(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>(
      API_ENDPOINTS.USER.TASKS,
      { params }
    );
    return response.data.data!;
  },

  async getUserTaskById(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(
      API_ENDPOINTS.USER.TASK_BY_ID(id)
    );
    return response.data.data!;
  },
};

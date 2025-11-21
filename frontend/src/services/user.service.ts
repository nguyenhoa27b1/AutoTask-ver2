import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { ApiResponse, User, PaginatedResponse, CreateUserForm } from '../types';

export const userService = {
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      API_ENDPOINTS.ADMIN.USERS,
      { params }
    );
    return response.data.data!;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.USER_BY_ID(id)
    );
    return response.data.data!;
  },

  async createUser(data: CreateUserForm): Promise<User> {
    const response = await api.post<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.USERS,
      data
    );
    return response.data.data!;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id));
  },

  async toggleUserActive(id: string): Promise<User> {
    const response = await api.put<ApiResponse<User>>(
      `${API_ENDPOINTS.ADMIN.USERS}/${id}/toggle-active`
    );
    return response.data.data!;
  },

  async exportUsers(): Promise<Blob> {
    const response = await api.get(API_ENDPOINTS.ADMIN.EXPORT_USERS, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getUserProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(
      API_ENDPOINTS.USER.PROFILE
    );
    return response.data.data!;
  },
};

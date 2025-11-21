import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import type { ApiResponse, LoginResponse } from '../types';

export const authService = {
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      { idToken }
    );
    return response.data.data!;
  },
};

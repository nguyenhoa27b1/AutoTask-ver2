export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    GOOGLE_LOGIN: '/auth/google',
  },
  // Admin
  ADMIN: {
    TASKS: '/admin/tasks',
    TASK_BY_ID: (id: string) => `/admin/tasks/${id}`,
    COMPLETE_TASK: (id: string) => `/admin/tasks/${id}/complete`,
    RESET_SCORE: (id: string) => `/admin/tasks/${id}/reset-score`,
    DELETE_TASK: (id: string) => `/admin/tasks/${id}`,
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    DELETE_USER: (id: string) => `/admin/users/${id}`,
    EXPORT_USERS: '/admin/users/export',
  },
  // User
  USER: {
    TASKS: '/user/tasks',
    TASK_BY_ID: (id: string) => `/user/tasks/${id}`,
    PROFILE: '/user/profile/score',
  },
  // Health
  HEALTH: '/health',
};

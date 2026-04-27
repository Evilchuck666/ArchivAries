import { apiClient } from './client';
import type { LoginResponse } from '../types/auth.types';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return res.data.data;
  },
  refresh: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/refresh', { refreshToken });
    return res.data.data as { accessToken: string; refreshToken: string };
  },
  logout: () => apiClient.post('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch('/auth/password', { currentPassword, newPassword }),
  verifyPassword: (currentPassword: string) =>
    apiClient.post('/auth/verify-password', { currentPassword }),
  validateInviteToken: (token: string) =>
    apiClient.get<{ data: { email: string } }>('/auth/invite/validate', { params: { token } }).then(r => r.data.data),
  activate: (token: string, displayName: string, password: string) =>
    apiClient.post('/auth/activate', { token, displayName, password }).then(r => (r.data as any).data),
};

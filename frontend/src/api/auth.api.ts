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
};

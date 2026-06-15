import { apiClient, unwrap } from './client';
import type { Role } from '../types/auth.types';

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  member: { displayName: string; avatarUrl: string | null; notes: string | null } | null;
}

export interface InviteResult {
  id: string;
  email: string;
  role: Role;
  devActivationUrl: string;
}

export const usersApi = {
  getAll: () =>
    apiClient.get<{ data: AdminUser[] }>('/users').then(unwrap),
  updateRole: (id: string, role: Role) =>
    apiClient.patch(`/users/${id}/role`, { role }).then(unwrap),
  updateStatus: (id: string, isActive: boolean, reason: string) =>
    apiClient.patch(`/users/${id}/status`, { isActive, reason }).then(unwrap),
  invite: (email: string, role?: Role) =>
    apiClient.post<{ data: InviteResult }>('/users/invite', { email, role }).then(unwrap),
};

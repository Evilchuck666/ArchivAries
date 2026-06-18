import { apiClient, unwrap } from './client';
import type { Member } from '../types/member.types';

export const membersApi = {
  getAll: (search?: string, status?: string) =>
    apiClient.get<{ data: Member[] }>('/members', { params: { search, status } }).then(unwrap),
  getMe: () =>
    apiClient.get<{ data: Member }>('/members/me').then(unwrap),
  getOne: (id: string) =>
    apiClient.get<{ data: Member }>(`/members/${id}`).then(unwrap),
  create: (data: any) =>
    apiClient.post<{ data: Member }>('/members', data).then(unwrap),
  updateMe: (data: Partial<Member>) =>
    apiClient.patch<{ data: Member }>('/members/me', data).then(unwrap),
  update: (id: string, data: Partial<Member>) =>
    apiClient.patch<{ data: Member }>(`/members/${id}`, data).then(unwrap),
  updateNotes: (id: string, notes: string) =>
    apiClient.patch<{ data: Member }>(`/members/${id}/notes`, { notes }).then(unwrap),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ data: Member }>('/members/me/avatar', formData).then(unwrap);
  },
};

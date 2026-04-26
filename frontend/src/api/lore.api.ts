import { apiClient, unwrap } from './client';
import type { LoreEntry } from '../types/lore.types';

export const loreApi = {
  getAll: (params?: { category?: string; tag?: string; search?: string }) =>
    apiClient.get<{ data: LoreEntry[] }>('/lore', { params }).then(unwrap),
  getOne: (id: string) =>
    apiClient.get<{ data: LoreEntry }>(`/lore/${id}`).then(unwrap),
  create: (data: any) =>
    apiClient.post<{ data: LoreEntry }>('/lore', data).then(unwrap),
  update: (id: string, data: any) =>
    apiClient.patch<{ data: LoreEntry }>(`/lore/${id}`, data).then(unwrap),
  remove: (id: string) =>
    apiClient.delete(`/lore/${id}`),
};

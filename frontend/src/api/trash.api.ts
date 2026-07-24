import { apiClient, unwrap } from './client';

export interface TrashItem {
  id: string;
  tableName: string;
  recordId: string;
  title: string;
  deletedAt: string;
  expiresAt: string;
  deletedById: string;
  deletedBy: { member: { displayName: string } | null };
}

export interface TrashListResponse {
  items: TrashItem[];
  total: number;
  page: number;
  limit: number;
}

export const trashApi = {
  getAll: (tableName?: string, page = 1, limit = 20) =>
    apiClient
      .get<{ data: TrashListResponse }>('/trash', { params: { tableName, page, limit } })
      .then(unwrap),
  restore: (id: string) =>
    apiClient.post<{ data: { restored: boolean } }>(`/trash/${id}/restore`).then(unwrap),
  permanentDelete: (id: string) =>
    apiClient.delete(`/trash/${id}`),
  purgeExpired: () =>
    apiClient.delete<{ data: { purged: number } }>('/trash/purge-expired').then(unwrap),
};

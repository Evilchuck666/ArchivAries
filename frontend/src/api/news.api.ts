import { apiClient, unwrap } from './client';
import type { NewsAnnouncement } from '../types/news.types';

export const newsApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get<{ data: NewsAnnouncement[] }>('/news', { params: { page, limit } }).then(unwrap),
  getImportant: () =>
    apiClient.get<{ data: NewsAnnouncement[] }>('/news/important').then(unwrap),
  getRecent: (limit = 5) =>
    apiClient.get<{ data: NewsAnnouncement[] }>('/news/recent', { params: { limit } }).then(unwrap),
  getOne: (id: string) =>
    apiClient.get<{ data: NewsAnnouncement }>(`/news/${id}`).then(unwrap),
  create: (data: any) =>
    apiClient.post<{ data: NewsAnnouncement }>('/news', data).then(unwrap),
  update: (id: string, data: any) =>
    apiClient.patch<{ data: NewsAnnouncement }>(`/news/${id}`, data).then(unwrap),
  remove: (id: string) =>
    apiClient.delete(`/news/${id}`),
};

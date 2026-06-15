import { apiClient, unwrap } from './client';
import type { Document, DocumentCategory } from '../types/document.types';

export const documentsApi = {
  getCategories: () =>
    apiClient.get<{ data: DocumentCategory[] }>('/document-categories').then(unwrap),
  createCategory: (data: any) =>
    apiClient.post('/document-categories', data).then(unwrap),
  getAll: (params?: { categoryId?: string; search?: string }) =>
    apiClient.get<{ data: Document[] }>('/documents', { params }).then(unwrap),
  getRecent: (limit = 5) =>
    apiClient.get<{ data: Document[] }>('/documents/recent', { params: { limit } }).then(unwrap),
  getOne: (id: string) =>
    apiClient.get<{ data: Document }>(`/documents/${id}`).then(unwrap),
  create: (data: any) =>
    apiClient.post<{ data: Document }>('/documents', data).then(unwrap),
  update: (id: string, data: any) =>
    apiClient.patch<{ data: Document }>(`/documents/${id}`, data).then(unwrap),
  remove: (id: string) =>
    apiClient.delete(`/documents/${id}`),
};

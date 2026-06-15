import { apiClient, unwrap } from './client';
import type { Event, EventParticipation } from '../types/event.types';

export const eventsApi = {
  getAll: (params?: { status?: string; dateFrom?: string; dateTo?: string }) =>
    apiClient.get<{ data: Event[] }>('/events', { params }).then(unwrap),
  getUpcoming: (limit = 5) =>
    apiClient.get<{ data: Event[] }>('/events/upcoming', { params: { limit } }).then(unwrap),
  getPublic: () =>
    apiClient.get<{ data: Event[] }>('/events/public').then(unwrap),
  getOne: (id: string) =>
    apiClient.get<{ data: Event }>(`/events/${id}`).then(unwrap),
  create: (data: any) =>
    apiClient.post<{ data: Event }>('/events', data).then(unwrap),
  update: (id: string, data: any) =>
    apiClient.patch<{ data: Event }>(`/events/${id}`, data).then(unwrap),
  remove: (id: string) =>
    apiClient.delete(`/events/${id}`),
  participate: (id: string, data: { status: string; notes?: string }) =>
    apiClient.post<{ data: EventParticipation }>(`/events/${id}/participate`, data).then(unwrap),
  getParticipants: (id: string) =>
    apiClient.get(`/events/${id}/participants`).then(unwrap),
};

import { apiClient, unwrap } from './client';
import type { Event } from '../types/event.types';
import type { NewsAnnouncement } from '../types/news.types';
import type { Document } from '../types/document.types';

export interface DashboardData {
  upcomingEvents: Event[];
  importantNews: NewsAnnouncement[];
  recentDocuments: Document[];
  myParticipations: { eventId: string; status: string }[];
}

export const dashboardApi = {
  get: () => apiClient.get<{ data: DashboardData }>('/dashboard').then(unwrap),
};

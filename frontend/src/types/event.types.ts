export type EventStatus = 'PLANNED' | 'CONFIRMED' | 'CANCELLED' | 'FINISHED';
export type AttendanceStatus = 'CONFIRMED' | 'DECLINED' | 'PENDING';

export interface Event {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  eventType: string;
  status: EventStatus;
  isPublic: boolean;
  isPublished: boolean;
  practicalInfo: string | null;
  createdAt: string;
  _count?: { participations: number };
  participations?: { status: AttendanceStatus }[];
  canDelete?: boolean;
}

export interface EventParticipation {
  eventId: string;
  status: AttendanceStatus;
  role: string | null;
  notes: string | null;
}

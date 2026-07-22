export interface NewsAnnouncement {
  id: string;
  title: string;
  content?: string;
  isImportant: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  creator?: { member: { displayName: string } | null };
  canDelete?: boolean;
}

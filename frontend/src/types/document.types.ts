export type DocumentVisibility = 'ALL_MEMBERS' | 'RESTRICTED';

export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count?: { documents: number };
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  summary: string | null;
  visibility: DocumentVisibility;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; slug: string };
  creator?: { member: { displayName: string } | null };
}

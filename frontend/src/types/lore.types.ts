export type LoreCategory =
  | 'HISTORY'
  | 'SYMBOLS'
  | 'ENEMIES'
  | 'FACTIONS'
  | 'PLACES'
  | 'CHARACTERS'
  | 'CHRONICLES'
  | 'OTHER';

export interface LoreEntry {
  id: string;
  title: string;
  content?: string;
  summary: string | null;
  category: LoreCategory;
  tags: string[];
  isPublished: boolean;
  updatedAt: string;
  creator?: { member: { displayName: string } | null };
}

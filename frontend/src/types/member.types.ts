export type MemberStatus = 'ACTIVE' | 'ASPIRANT' | 'INACTIVE' | 'ALUMNI' | 'COLLABORATOR';

export interface Member {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  status: MemberStatus;
  rank: string | null;
  joinedAt: string;
  discordHandle: string | null;
  // admin-only fields
  realName?: string;
  phone?: string;
  notes?: string;
  user?: { email: string; role: string; isActive: boolean };
}

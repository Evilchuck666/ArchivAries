export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'COLLABORATOR';

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
  // self + admin fields
  realName?: string;
  phone?: string | null;
  showPhone?: boolean;
  birthDate?: string | null;
  showBirthDate?: boolean;
  dni?: string | null;
  address?: string | null;
  // admin-only fields
  notes?: string;
  user?: { email: string; role: string; isActive: boolean };
}

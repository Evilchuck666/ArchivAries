export type Role = 'VISITOR' | 'MEMBER' | 'AREA_MANAGER' | 'BOARD' | 'ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  displayName: string;
  avatarUrl: string | null;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

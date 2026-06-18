export type Role = string;

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  level: number;
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

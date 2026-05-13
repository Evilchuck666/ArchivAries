import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '../types/auth.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string, permissions?: string[]) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setPermissions: (permissions: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken, permissions = []) =>
        set({ user, accessToken, refreshToken, permissions, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setPermissions: (permissions) =>
        set({ permissions }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, permissions: [], isAuthenticated: false }),
    }),
    {
      name: 'archivaries-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

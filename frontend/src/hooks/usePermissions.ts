import { useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';

export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions);
  const can = useCallback((key: string) => permissions.includes(key), [permissions]);
  return { can };
}

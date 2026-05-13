import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { permissionsApi } from '../api/permissions.api';
import { ROUTES } from './routes';

export function ProtectedRoute() {
  const { isAuthenticated, setPermissions } = useAuthStore();

  // Refresh permissions every 5 minutes while the app is open.
  // This ensures changes made by admin take effect without requiring re-login.
  useQuery({
    queryKey: ['permissions-me'],
    queryFn: async () => {
      const perms = await permissionsApi.getMyPermissions();
      setPermissions(perms);
      return perms;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
}

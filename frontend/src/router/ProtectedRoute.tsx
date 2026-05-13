import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { permissionsApi } from '../api/permissions.api';
import { ROUTES } from './routes';

export function ProtectedRoute() {
  const { isAuthenticated, permissions, setPermissions } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && permissions.length === 0) {
      permissionsApi.getMyPermissions().then(setPermissions).catch(() => {});
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
}

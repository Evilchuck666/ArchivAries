import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from './routes';

interface Props {
  minLevel: number;
}

export function RoleRoute({ minLevel }: Props) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if ((user.level ?? 0) < minLevel) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <Outlet />;
}

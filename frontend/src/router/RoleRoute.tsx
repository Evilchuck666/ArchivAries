import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { Role } from '../types/auth.types';
import { ROUTES } from './routes';

const ROLE_HIERARCHY: Role[] = ['VISITOR', 'MEMBER', 'AREA_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

interface Props {
  minRole: Role;
}

export function RoleRoute({ minRole }: Props) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  const userIndex = ROLE_HIERARCHY.indexOf(user.role);
  const minIndex = ROLE_HIERARCHY.indexOf(minRole);
  if (userIndex < minIndex) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <Outlet />;
}

import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { ROUTES } from './routes';

interface Props {
  permission: string;
}

export function PermissionRoute({ permission }: Props) {
  const { can } = usePermissions();
  if (!can(permission)) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <Outlet />;
}

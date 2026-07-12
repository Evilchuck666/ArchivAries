import { Navigate, Outlet, useParams } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { ROUTES } from './routes';

interface Props {
  permission: string;
  redirectTo?: string;
}

export function PermissionRoute({ permission, redirectTo }: Props) {
  const { can } = usePermissions();
  const params = useParams();

  if (!can(permission)) {
    let target = redirectTo ?? ROUTES.DASHBOARD;
    Object.entries(params).forEach(([key, val]) => {
      if (val) target = target.replace(`:${key}`, val);
    });
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

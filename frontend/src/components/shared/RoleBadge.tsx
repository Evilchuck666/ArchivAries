import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import type { Role } from '../../types/auth.types';

const roleColors: Record<Role, 'gray' | 'blue' | 'amber' | 'red' | 'purple'> = {
  VISITOR: 'gray',
  MEMBER: 'blue',
  AREA_MANAGER: 'purple',
  ADMIN: 'amber',
  SUPER_ADMIN: 'red',
};

export function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation('common');
  return <Badge color={roleColors[role]}>{t(`roles.${role}`)}</Badge>;
}

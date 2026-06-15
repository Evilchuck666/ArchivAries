import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import type { MemberStatus } from '../../types/member.types';

const statusColors: Record<MemberStatus, 'green' | 'gray' | 'purple' | 'blue'> = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  ALUMNI: 'purple',
  COLLABORATOR: 'blue',
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const { t } = useTranslation('common');
  return <Badge color={statusColors[status]}>{t(`status.${status}`)}</Badge>;
}

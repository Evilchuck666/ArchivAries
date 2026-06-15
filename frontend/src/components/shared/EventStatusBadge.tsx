import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import type { EventStatus } from '../../types/event.types';

const statusColors: Record<EventStatus, 'blue' | 'green' | 'red' | 'gray'> = {
  PLANNED: 'blue',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  FINISHED: 'gray',
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { t } = useTranslation('common');
  return <Badge color={statusColors[status]}>{t(`status.${status}`)}</Badge>;
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../api/events.api';
import { EventStatusBadge } from '../../components/shared/EventStatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/auth.store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ROLE_HIERARCHY = ['VISITOR', 'MEMBER', 'AREA_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
const FILTER_OPTIONS = ['ONGOING', 'PLANNED', 'CONFIRMED', 'CANCELLED', 'FINISHED'];

function computeDisplayStatus(event: { status: string; startDate: string; endDate?: string | null }): string {
  if (event.status === 'CANCELLED') return 'CANCELLED';
  if (event.status === 'FINISHED') return 'FINISHED';
  const now = new Date();
  const end = event.endDate ? new Date(event.endDate) : null;
  if (new Date(event.startDate) < now && end !== null && end >= now) return 'ONGOING';
  // Keep DB status (PLANNED / CONFIRMED) for filtering, regardless of date
  return event.status;
}

export function EventListPage() {
  const { t } = useTranslation('events');
  const { t: tc } = useTranslation('common');
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('');
  const canCreate = user && ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf('AREA_MANAGER');

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll(),
    staleTime: 30_000,
  });

  const events = filter ? allEvents.filter((e) => computeDisplayStatus(e) === filter) : allEvents;

  const filterLabel = (f: string) => {
    if (f === 'ONGOING') return t('event_ongoing');
    return tc(`status.${f}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <Link to="/app/events/calendar" className="text-sm text-amber-400 hover:text-amber-300">
            🗓 {t('calendar_view')}
          </Link>
          {canCreate && (
            <Link
              to="/app/events/create"
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-3 py-1.5 rounded-md transition-colors border border-amber-500"
            >
              + {t('create_event')}
            </Link>
          )}
        </div>
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="">{t('all_statuses')}</option>
        {FILTER_OPTIONS.map((f) => (
          <option key={f} value={f}>{filterLabel(f)}</option>
        ))}
      </select>

      {isLoading ? (
        <Spinner className="py-20" />
      ) : events.length === 0 ? (
        <EmptyState title={t('no_events')} icon={<span className="text-5xl">📅</span>} />
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/app/events/${event.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-amber-800 rounded-lg p-4 transition-colors group flex gap-4 items-start"
            >
              <div className="shrink-0 bg-slate-800 rounded p-2 text-center min-w-14">
                <p className="text-xs text-slate-500 uppercase">{format(new Date(event.startDate), 'MMM', { locale: es })}</p>
                <p className="text-2xl font-bold text-amber-300 leading-none">{format(new Date(event.startDate), 'd')}</p>
                <p className="text-xs text-slate-500">{format(new Date(event.startDate), 'yyyy')}</p>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">{event.title}</h3>
                {event.location && <p className="text-xs text-slate-500 mt-0.5">📍 {event.location}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {(() => {
                    const now = new Date();
                    const end = event.endDate ? new Date(event.endDate) : null;
                    const isOngoing = new Date(event.startDate) < now && end !== null && end >= now;
                    const isPast = end ? end < now : new Date(event.startDate) < now;
                    const isActiveStatus = event.status !== 'CANCELLED' && event.status !== 'FINISHED';
                    if (isOngoing) return <Badge color="yellow">{t('event_ongoing')}</Badge>;
                    if (isPast && isActiveStatus) return <Badge color="purple">{t('event_past')}</Badge>;
                    return <EventStatusBadge status={event.status} />;
                  })()}
                  {event.participations?.[0] ? (
                    <Badge color={
                      event.participations[0].status === 'CONFIRMED' ? 'green'
                      : event.participations[0].status === 'DECLINED' ? 'red'
                      : 'gray'
                    }>
                      {t(`rsvp_status.${event.participations[0].status}`)}
                    </Badge>
                  ) : (() => {
                    const end = event.endDate ? new Date(event.endDate) : null;
                    const isPast = end ? end < new Date() : new Date(event.startDate) < new Date();
                    if (event.status === 'CANCELLED' || event.status === 'FINISHED') return null;
                    return isPast
                      ? <Badge color="amber">{t('rsvp_not_registered_past')}</Badge>
                      : <Badge color="amber">{t('rsvp_not_registered')}</Badge>;
                  })()}
                  {event.eventType && (
                    <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                      {event.eventType}
                    </span>
                  )}
                  {event._count && <span className="text-xs text-slate-500">👥 {event._count.participations}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

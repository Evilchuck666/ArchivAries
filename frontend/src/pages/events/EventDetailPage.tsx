import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../api/events.api';
import { EventStatusBadge } from '../../components/shared/EventStatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { useAuthStore } from '../../store/auth.store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('events');
  const { t: tc } = useTranslation('common');
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getOne(id!),
    enabled: !!id,
  });

  const [pendingAction, setPendingAction] = useState<'CONFIRMED' | 'DECLINED' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: rsvpMutate, isPending } = useMutation({
    mutationFn: (status: 'CONFIRMED' | 'DECLINED') =>
      eventsApi.participate(id!, { status }),
    onSuccess: () => {
      setPendingAction(null);
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => setPendingAction(null),
  });

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
    mutationFn: () => eventsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/app/events');
    },
  });

  const rsvp = (status: 'CONFIRMED' | 'DECLINED') => {
    setPendingAction(status);
    rsvpMutate(status);
  };

  if (isLoading) return <Spinner className="py-20" />;
  if (!event) return <p className="text-slate-500">{t('not_found')}</p>;

  const now = new Date();
  const _end = event.endDate ? new Date(event.endDate) : null;
  const isPast = _end ? _end < now : new Date(event.startDate) < now;

  const canEdit = user && (
    user.id === event.creatorId ||
    ['AREA_MANAGER', 'BOARD', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)
  );
  const canDelete = user && (
    user.id === event.creatorId ||
    ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/app/events" className="text-sm text-slate-400 hover:text-amber-300">
          {t('back_to_events')}
        </Link>
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link to={`/app/events/${event.id}/edit`}>
                <Button variant="ghost" size="sm">{tc('actions.edit')}</Button>
              </Link>
            )}
            {canDelete && (
              confirmDelete ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEvent()}
                  loading={isDeleting}
                  className="text-red-400 border-red-900 hover:bg-red-950"
                >
                  {t('delete_confirm_yes')}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-400 border-red-900 hover:bg-red-950"
                >
                  {tc('actions.delete')}
                </Button>
              )
            )}
          </div>
        )}
      </div>

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-serif text-amber-200">{event.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{event.eventType}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(() => {
              const isOngoing = new Date(event.startDate) < now && _end !== null && _end >= now;
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
                {t(`${isPast ? 'rsvp_status_past' : 'rsvp_status'}.${event.participations[0].status}`)}
              </Badge>
            ) : (
              event.status !== 'CANCELLED' && event.status !== 'FINISHED'
                ? isPast
                  ? <Badge color="amber">{t('rsvp_not_registered_past')}</Badge>
                  : <Badge color="amber">{t('rsvp_not_registered')}</Badge>
                : null
            )}
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <dt className="text-xs text-slate-500 uppercase tracking-wide mb-1">{t('date')}</dt>
            <dd className="text-slate-300 text-sm">
              {format(new Date(event.startDate), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
              {event.endDate && ` → ${format(new Date(event.endDate), "d 'de' MMMM yyyy", { locale: es })}`}
            </dd>
          </div>
          {event.location && (
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide mb-1">{t('location')}</dt>
              <dd className="text-slate-300 text-sm">📍 {event.location}</dd>
            </div>
          )}
        </dl>

        {(() => {
          const myStatus = event.participations?.[0]?.status;
          const isConfirmed = myStatus === 'CONFIRMED';
          const isDeclined = myStatus === 'DECLINED';
          const lockRsvp = isPast && (isConfirmed || isDeclined);
          return (
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() => rsvp('CONFIRMED')}
                loading={isPending && pendingAction === 'CONFIRMED'}
                disabled={isPending || isConfirmed || lockRsvp}
              >
                ✓ {isPast ? t('rsvp_confirm_past') : t('rsvp_confirm')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => rsvp('DECLINED')}
                loading={isPending && pendingAction === 'DECLINED'}
                disabled={isPending || isDeclined || lockRsvp}
              >
                ✗ {isPast ? t('rsvp_decline_past') : t('rsvp_decline')}
              </Button>
            </div>
          );
        })()}
      </Card>

      {event.description && (
        <Card title={t('description')} className="mb-4">
          <MarkdownRenderer content={event.description} />
        </Card>
      )}

      {event.practicalInfo && (
        <Card title={t('practical_info')}>
          <MarkdownRenderer content={event.practicalInfo} />
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../api/events.api';
import { EventStatusBadge } from '../../components/shared/EventStatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('events');
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getOne(id!),
    enabled: !!id,
  });

  const [pendingAction, setPendingAction] = useState<'CONFIRMED' | 'DECLINED' | null>(null);

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

  const rsvp = (status: 'CONFIRMED' | 'DECLINED') => {
    setPendingAction(status);
    rsvpMutate(status);
  };

  if (isLoading) return <Spinner className="py-20" />;
  if (!event) return <p className="text-slate-500">{t('not_found')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/app/events" className="text-sm text-slate-400 hover:text-amber-300 mb-6 inline-block">
        {t('back_to_events')}
      </Link>

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-serif text-amber-200">{event.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{event.eventType}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(() => {
              const now = new Date();
              const isOngoing = new Date(event.startDate) < now
                && event.endDate !== null
                && new Date(event.endDate) >= now;
              return isOngoing
                ? <Badge color="yellow">{t('event_ongoing')}</Badge>
                : <EventStatusBadge status={event.status} />;
            })()}
            {event.participations?.[0] && (
              <Badge color={
                event.participations[0].status === 'CONFIRMED' ? 'green'
                : event.participations[0].status === 'DECLINED' ? 'red'
                : 'gray'
              }>
                {t(`rsvp_status.${event.participations[0].status}`)}
              </Badge>
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
          return (
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() => rsvp('CONFIRMED')}
                loading={isPending && pendingAction === 'CONFIRMED'}
                disabled={isPending || isConfirmed}
              >
                ✓ {t('rsvp_confirm')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => rsvp('DECLINED')}
                loading={isPending && pendingAction === 'DECLINED'}
                disabled={isPending || isDeclined}
              >
                ✗ {t('rsvp_decline')}
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

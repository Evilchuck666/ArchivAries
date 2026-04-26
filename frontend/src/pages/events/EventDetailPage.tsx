import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import { EventStatusBadge } from '../../components/shared/EventStatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getOne(id!),
    enabled: !!id,
  });

  const { mutate: rsvp, isPending } = useMutation({
    mutationFn: (status: 'CONFIRMED' | 'DECLINED') =>
      eventsApi.participate(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!event) return <p className="text-slate-500">Evento no encontrado.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/app/events" className="text-sm text-slate-400 hover:text-amber-300 mb-6 inline-block">
        ← Volver a eventos
      </Link>

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-serif text-amber-200">{event.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{event.eventType}</p>
          </div>
          <EventStatusBadge status={event.status} />
        </div>

        <dl className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <dt className="text-xs text-slate-500 uppercase tracking-wide mb-1">Fecha</dt>
            <dd className="text-slate-300 text-sm">
              {format(new Date(event.startDate), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
              {event.endDate && ` → ${format(new Date(event.endDate), "d 'de' MMMM yyyy", { locale: es })}`}
            </dd>
          </div>
          {event.location && (
            <div>
              <dt className="text-xs text-slate-500 uppercase tracking-wide mb-1">Lugar</dt>
              <dd className="text-slate-300 text-sm">📍 {event.location}</dd>
            </div>
          )}
        </dl>

        <div className="flex gap-2 pt-3 border-t border-slate-800">
          <Button
            variant="primary"
            size="sm"
            onClick={() => rsvp('CONFIRMED')}
            loading={isPending}
          >
            ✓ Confirmar asistencia
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => rsvp('DECLINED')}
            disabled={isPending}
          >
            ✗ No puedo asistir
          </Button>
        </div>
      </Card>

      {event.description && (
        <Card title="Descripción" className="mb-4">
          <MarkdownRenderer content={event.description} />
        </Card>
      )}

      {event.practicalInfo && (
        <Card title="Información práctica">
          <MarkdownRenderer content={event.practicalInfo} />
        </Card>
      )}
    </div>
  );
}

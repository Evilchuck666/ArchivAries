import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventsApi } from '../../api/events.api';

const EVENT_PALETTE = [
  { bg: '#1e3a5f', border: '#1d4ed8' },
  { bg: '#14532d', border: '#15803d' },
  { bg: '#3b0764', border: '#7c3aed' },
  { bg: '#7c2d12', border: '#c2410c' },
  { bg: '#0f3460', border: '#0e7490' },
  { bg: '#4a1942', border: '#a21caf' },
  { bg: '#1c3828', border: '#059669' },
  { bg: '#312e81', border: '#4f46e5' },
  { bg: '#713f12', border: '#d97706' },
  { bg: '#134e4a', border: '#0d9488' },
  { bg: '#4c1d24', border: '#e11d48' },
  { bg: '#1a2e05', border: '#65a30d' },
  { bg: '#0c2340', border: '#0284c7' },
  { bg: '#2d1b69', border: '#8b5cf6' },
  { bg: '#3d1515', border: '#ef4444' },
  { bg: '#042f2e', border: '#14b8a6' },
  { bg: '#1e1b4b', border: '#818cf8' },
  { bg: '#451a03', border: '#f97316' },
  { bg: '#1a1a2e', border: '#a78bfa' },
  { bg: '#052e16', border: '#22c55e' },
];

export function CalendarPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const { data: events = [] } = useQuery({
    queryKey: ['events-all'],
    queryFn: () => eventsApi.getAll(),
    staleTime: 60_000,
  });

  // Sort by id for a stable order, then assign palette colors sequentially
  const sorted = [...events].sort((a, b) => a.id.localeCompare(b.id));
  let paletteIndex = 0;
  const colorById = new Map<string, (typeof EVENT_PALETTE)[number]>();
  for (const e of sorted) {
    if (e.status !== 'CANCELLED') {
      colorById.set(e.id, EVENT_PALETTE[paletteIndex % EVENT_PALETTE.length]);
      paletteIndex++;
    }
  }

  const calEvents = events.map((e) => {
    if (e.status === 'CANCELLED') {
      return { id: e.id, title: e.title, start: e.startDate, end: e.endDate ?? undefined, backgroundColor: '#7f1d1d', borderColor: '#991b1b' };
    }
    const color = colorById.get(e.id)!;
    return { id: e.id, title: e.title, start: e.startDate, end: e.endDate ?? undefined, backgroundColor: color.bg, borderColor: color.border };
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('nav.calendar')}</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 [&_.fc-theme-standard_.fc-scrollgrid]:border-slate-700 [&_.fc-col-header-cell-cushion]:text-slate-400 [&_.fc-daygrid-day-number]:text-slate-400 [&_.fc-toolbar-title]:text-amber-200 [&_.fc-toolbar-title]:font-serif [&_.fc-button]:bg-slate-700 [&_.fc-button]:border-slate-600 [&_.fc-button]:text-slate-200 [&_.fc-button:hover]:bg-slate-600 [&_.fc-button-active]:bg-amber-700 [&_.fc-day-today]:bg-amber-900/10">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          firstDay={1}
          events={calEvents}
          locale="es"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          eventClick={(info) => navigate(`/app/events/${info.event.id}`)}
          height="auto"
        />
      </div>
    </div>
  );
}

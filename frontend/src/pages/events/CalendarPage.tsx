import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventsApi } from '../../api/events.api';

export function CalendarPage() {
  const navigate = useNavigate();

  const { data: events = [] } = useQuery({
    queryKey: ['events-all'],
    queryFn: () => eventsApi.getAll(),
    staleTime: 60_000,
  });

  const calEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startDate,
    end: e.endDate ?? undefined,
    backgroundColor: e.status === 'CANCELLED' ? '#7f1d1d' : e.status === 'CONFIRMED' ? '#14532d' : '#1e3a5f',
    borderColor: e.status === 'CANCELLED' ? '#991b1b' : e.status === 'CONFIRMED' ? '#166534' : '#1d4ed8',
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">Calendario</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 [&_.fc-theme-standard_.fc-scrollgrid]:border-slate-700 [&_.fc-col-header-cell-cushion]:text-slate-400 [&_.fc-daygrid-day-number]:text-slate-400 [&_.fc-toolbar-title]:text-amber-200 [&_.fc-toolbar-title]:font-serif [&_.fc-button]:bg-slate-700 [&_.fc-button]:border-slate-600 [&_.fc-button]:text-slate-200 [&_.fc-button:hover]:bg-slate-600 [&_.fc-button-active]:bg-amber-700 [&_.fc-day-today]:bg-amber-900/10">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
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

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '../../api/dashboard.api';
import { useAuthStore } from '../../store/auth.store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EventStatusBadge } from '../../components/shared/EventStatusBadge';
import { ROUTES } from '../../router/routes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Event } from '../../types/event.types';
import type { NewsAnnouncement } from '../../types/news.types';
import type { Document } from '../../types/document.types';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    staleTime: 60_000,
  });

  if (isLoading) return <Spinner className="py-20" />;

  const upcomingEvents: Event[] = data?.upcomingEvents ?? [];
  const importantNews: NewsAnnouncement[] = data?.importantNews ?? [];
  const recentDocuments: Document[] = data?.recentDocuments ?? [];
  const myParticipations: { eventId: string; status: string }[] = data?.myParticipations ?? [];

  const rsvpMap = Object.fromEntries(myParticipations.map((p) => [p.eventId, p.status]));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-amber-200">
          {t('welcome', { name: user?.displayName })}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Events */}
        <Card
          title={t('upcoming_events')}
          action={<Link to={ROUTES.EVENTS} className="text-xs text-amber-400 hover:text-amber-300">{tc('actions.view_all')}</Link>}
        >
          {upcomingEvents.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">{t('no_upcoming_events')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link to={`/app/events/${event.id}`} className="flex items-start gap-3 group">
                    <div className="shrink-0 bg-slate-800 rounded px-2 py-1 text-center min-w-12">
                      <p className="text-xs text-slate-500">{format(new Date(event.startDate), 'MMM', { locale: es }).toUpperCase()}</p>
                      <p className="text-lg font-bold text-amber-300 leading-none">{format(new Date(event.startDate), 'd')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-amber-300 transition-colors truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
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
                        {rsvpMap[event.id] ? (
                          <Badge color={rsvpMap[event.id] === 'CONFIRMED' ? 'green' : 'red'}>
                            {rsvpMap[event.id] === 'CONFIRMED' ? t('rsvp_confirmed') : t('rsvp_declined')}
                          </Badge>
                        ) : (() => {
                          const end = event.endDate ? new Date(event.endDate) : null;
                          const isPast = end ? end < new Date() : new Date(event.startDate) < new Date();
                          if (event.status === 'CANCELLED' || event.status === 'FINISHED') return null;
                          return isPast
                            ? <Badge color="amber">{t('rsvp_not_registered_past')}</Badge>
                            : <Badge color="amber">{t('rsvp_not_registered')}</Badge>;
                        })()}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Important News */}
        <Card
          title={t('important_news')}
          action={<Link to={ROUTES.NEWS} className="text-xs text-amber-400 hover:text-amber-300">{tc('actions.view_all')}</Link>}
        >
          {importantNews.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">{t('no_important_news')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {importantNews.map((news) => (
                <li key={news.id}>
                  <Link
                    to={`/app/news/${news.id}`}
                    className="flex items-center gap-2 py-2 border-b border-slate-800 last:border-0 group"
                  >
                    <span className="text-amber-500 shrink-0">⚠</span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 group-hover:text-amber-300 transition-colors truncate">{news.title}</p>
                      <p className="text-xs text-slate-500">{format(new Date(news.publishedAt), 'd MMM yyyy', { locale: es })}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent Documents */}
      <Card
        title={t('recent_documents')}
        action={<Link to={ROUTES.DOCUMENTS} className="text-xs text-amber-400 hover:text-amber-300">{tc('actions.view_all')}</Link>}
      >
        {recentDocuments.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">{t('no_recent_documents')}</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentDocuments.map((doc) => (
              <Link
                key={doc.id}
                to={`/app/documents/${doc.id}`}
                className="block bg-slate-800 hover:bg-slate-700 rounded-lg p-3 transition-colors group"
              >
                <span className="text-xs text-amber-600 font-medium">{doc.category.name}</span>
                <p className="text-sm font-medium text-slate-200 group-hover:text-amber-300 transition-colors mt-1 truncate">{doc.title}</p>
                <p className="text-xs text-slate-500 mt-1">{format(new Date(doc.updatedAt), 'd MMM', { locale: es })}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Quick links */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">{t('quick_links')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: ROUTES.MEMBERS, icon: '🛡️', label: tc('nav.members') },
            { to: ROUTES.CALENDAR, icon: '🗓️', label: tc('nav.calendar') },
            { to: ROUTES.LORE, icon: '🔮', label: tc('nav.lore') },
            { to: ROUTES.MEMBER_ME, icon: '👤', label: tc('nav.profile') },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-slate-900 border border-slate-800 hover:border-amber-800 rounded-lg p-4 text-center transition-colors group"
            >
              <span className="text-2xl block mb-2">{item.icon}</span>
              <span className="text-xs text-slate-400 group-hover:text-amber-300 transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

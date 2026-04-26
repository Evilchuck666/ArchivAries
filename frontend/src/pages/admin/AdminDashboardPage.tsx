import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';

export function AdminDashboardPage() {
  const { t } = useTranslation('common');

  const sections = [
    { to: '/app/admin/users', icon: '👥', label: t('admin.users'), desc: t('admin.users_desc') },
    { to: '/app/documents', icon: '📜', label: t('nav.documents'), desc: t('admin.documents_desc') },
    { to: '/app/news', icon: '📢', label: t('nav.news'), desc: t('admin.news_desc') },
    { to: '/app/events', icon: '📅', label: t('nav.events'), desc: t('admin.events_desc') },
    { to: '/app/lore', icon: '📚', label: t('nav.lore'), desc: t('admin.lore_desc') },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-2">{t('admin.title')}</h1>
      <p className="text-slate-400 text-sm mb-8">{t('admin.subtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.to} to={s.to}>
            <Card className="hover:border-amber-800 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <p className="font-medium text-amber-100 text-sm">{s.label}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

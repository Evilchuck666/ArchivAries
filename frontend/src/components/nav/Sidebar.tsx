import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../router/routes';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  permission?: string;
  end?: boolean;
}

export function Sidebar() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { sidebarOpen } = useUiStore();
  const { can } = usePermissions();

  const navItems: NavItem[] = [
    { to: ROUTES.DASHBOARD, label: t('nav.dashboard'), icon: '⚔️' },
    { to: ROUTES.MEMBERS, label: t('nav.members'), icon: '🛡️', permission: 'members.read' },
    { to: ROUTES.EVENTS, label: t('nav.events'), icon: '📅', permission: 'events.read' },
    { to: ROUTES.CALENDAR, label: t('nav.calendar'), icon: '🗓️', permission: 'calendar.read' },
    { to: ROUTES.DOCUMENTS, label: t('nav.documents'), icon: '📜', permission: 'documents.read' },
    { to: ROUTES.NEWS, label: t('nav.news'), icon: '📢', permission: 'news.read' },
    { to: ROUTES.LORE, label: t('nav.lore'), icon: '🔮', permission: 'lore.read' },
    { to: ROUTES.ADMIN, label: t('nav.admin'), icon: '⚙️', permission: 'users.manage', end: true },
    { to: ROUTES.ADMIN_TRASH, label: t('nav.trash'), icon: '🗑️', permission: 'trash.read' },
  ];

  if (!user) return null;

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-56' : 'w-14'
      } min-h-screen shrink-0`}
    >
      <div className={`flex items-center gap-2 px-4 h-14 border-b border-slate-800 ${sidebarOpen ? '' : 'justify-center'}`}>
        <span className="text-2xl">🐐</span>
        {sidebarOpen && (
          <div>
            <p className="text-amber-300 font-serif font-semibold text-sm leading-tight">ArchivAries</p>
            <p className="text-slate-500 text-xs">Aries Ferrus</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-0.5">
        {navItems
          .filter((item) => {
            if (item.permission) return can(item.permission);
            return true;
          })
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? item.to === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'text-amber-300 bg-amber-900/20 border-r-2 border-amber-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                } ${sidebarOpen ? '' : 'justify-center'}`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}

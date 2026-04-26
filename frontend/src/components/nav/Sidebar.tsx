import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { ROUTES } from '../../router/routes';
import type { Role } from '../../types/auth.types';

const ROLE_HIERARCHY: Role[] = ['VISITOR', 'MEMBER', 'AREA_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

function hasRole(userRole: Role, minRole: Role) {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minRole);
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  minRole?: Role;
}

export function Sidebar() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { sidebarOpen } = useUiStore();

  const navItems: NavItem[] = [
    { to: ROUTES.DASHBOARD, label: t('nav.dashboard'), icon: '⚔️' },
    { to: ROUTES.MEMBERS, label: t('nav.members'), icon: '🛡️', minRole: 'MEMBER' },
    { to: ROUTES.EVENTS, label: t('nav.events'), icon: '📅', minRole: 'MEMBER' },
    { to: ROUTES.CALENDAR, label: t('nav.calendar'), icon: '🗓️', minRole: 'MEMBER' },
    { to: ROUTES.DOCUMENTS, label: t('nav.documents'), icon: '📜', minRole: 'MEMBER' },
    { to: ROUTES.NEWS, label: t('nav.news'), icon: '📢', minRole: 'MEMBER' },
    { to: ROUTES.LORE, label: t('nav.lore'), icon: '🔮', minRole: 'MEMBER' },
    { to: ROUTES.ADMIN, label: t('nav.admin'), icon: '⚙️', minRole: 'ADMIN' },
  ];

  if (!user) return null;

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-56' : 'w-14'
      } min-h-screen shrink-0`}
    >
      <div className={`flex items-center gap-2 px-4 py-4 border-b border-slate-800 ${sidebarOpen ? '' : 'justify-center'}`}>
        <span className="text-2xl">⚜️</span>
        {sidebarOpen && (
          <div>
            <p className="text-amber-300 font-serif font-semibold text-sm leading-tight">ArchivAries</p>
            <p className="text-slate-500 text-xs">Aries Ferrus</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-0.5">
        {navItems
          .filter((item) => !item.minRole || hasRole(user.role, item.minRole))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.DASHBOARD}
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

import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { authApi } from '../../api/auth.api';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ROUTES } from '../../router/routes';

export function Topbar() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore if logout API fails
    }
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
      <button
        onClick={toggleSidebar}
        className="text-slate-400 hover:text-amber-300 transition-colors p-1 rounded cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Link to={ROUTES.MEMBER_ME} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-amber-100">
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <span className="text-sm text-slate-300 hidden sm:block">{user?.displayName}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          title={t('nav.logout')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

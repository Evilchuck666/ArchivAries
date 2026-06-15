import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/nav/LanguageSwitcher';
import { ROUTES } from '../router/routes';

export function PublicLayout() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <span className="text-2xl">🐐</span>
            <div>
              <p className="text-amber-300 font-serif font-semibold leading-tight">ArchivAries</p>
              <p className="text-slate-500 text-xs">Aries Ferrus</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to={ROUTES.LOGIN}
              className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              {t('nav.dashboard')} →
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

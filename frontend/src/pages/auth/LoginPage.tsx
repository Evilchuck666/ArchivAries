import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../router/routes';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, accessToken, refreshToken } = await authApi.login(email, password);
      setAuth(user, accessToken, refreshToken);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      const status = err.response?.status;
      setError(status === 401 ? t('login.error_invalid') : t('login.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🐐</span>
          <h1 className="text-2xl font-serif text-amber-300 mt-3 mb-1">ArchivAries</h1>
          <p className="text-slate-500 text-sm">{t('login.subtitle')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-amber-100 mb-6 text-center">{t('login.title')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label={t('login.email_label')}
              placeholder={t('login.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              id="password"
              type="password"
              label={t('login.password_label')}
              placeholder={t('login.password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} className="mt-2 w-full">
              {loading ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Aries Ferrus — Compañía de Rol en Vivo
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { ROUTES } from '../../router/routes';

export function ActivatePage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { setAuth } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { isLoading: validating, isError: tokenInvalid } = useQuery({
    queryKey: ['invite-validate', token],
    queryFn: () => authApi.validateInviteToken(token),
    enabled: !!token,
    retry: false,
  });

  const activateMutation = useMutation({
    mutationFn: () => authApi.activate(token, displayName, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate(ROUTES.MEMBER_ME, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (password.length < 8) {
      setValidationError(t('activate.password_min_length'));
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(t('activate.password_mismatch'));
      return;
    }
    activateMutation.mutate();
  };

  if (!token || (!validating && tokenInvalid)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl">🐐</span>
          <h1 className="text-2xl font-serif text-amber-300 mt-3 mb-6">ArchivAries</h1>
          <div className="bg-slate-900 border border-red-900 rounded-xl p-6">
            <p className="text-red-400 text-sm">{t('activate.invalid_token')}</p>
          </div>
          <p className="text-center text-slate-600 text-xs mt-6">{t('footer')}</p>
        </div>
      </div>
    );
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🐐</span>
          <h1 className="text-2xl font-serif text-amber-300 mt-3 mb-1">ArchivAries</h1>
          <p className="text-slate-500 text-sm">{t('activate.subtitle')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-amber-100 mb-6 text-center">
            {t('activate.title')}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t('activate.display_name_label')}
              placeholder={t('activate.display_name_placeholder')}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              type="password"
              label={t('activate.password_label')}
              placeholder={t('activate.password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Input
              type="password"
              label={t('activate.confirm_password_label')}
              placeholder={t('activate.confirm_password_placeholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {(validationError || activateMutation.isError) && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-md px-3 py-2">
                {validationError || t('activate.error')}
              </p>
            )}
            <Button
              type="submit"
              loading={activateMutation.isPending}
              disabled={!displayName || !password || !confirmPassword}
              className="mt-2 w-full"
            >
              {activateMutation.isPending ? t('activate.submitting') : t('activate.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">{t('footer')}</p>
      </div>
    </div>
  );
}

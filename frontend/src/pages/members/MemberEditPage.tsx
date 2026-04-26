import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../../api/members.api';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ROUTES } from '../../router/routes';

interface ProfileFormData {
  displayName: string;
  realName: string;
  bio: string;
  phone: string;
  showPhone: boolean;
  discordHandle: string;
  avatarUrl: string;
  birthDate: string;
  showBirthDate: boolean;
  dni: string;
  address: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function MemberEditPage() {
  const { t } = useTranslation('members');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const updated = await membersApi.uploadAvatar(file);
      profileForm.setValue('avatarUrl', updated.avatarUrl ?? '', { shouldDirty: true });
    } catch {
      setUploadError(t('upload_error'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const { data: member, isLoading } = useQuery({
    queryKey: ['member-me'],
    queryFn: membersApi.getMe,
  });

  const profileForm = useForm<ProfileFormData>();
  const avatarUrl = profileForm.watch('avatarUrl');

  useEffect(() => {
    if (member) {
      profileForm.reset({
        displayName: member.displayName,
        realName: member.realName ?? '',
        bio: member.bio ?? '',
        phone: member.phone ?? '',
        showPhone: member.showPhone ?? false,
        discordHandle: member.discordHandle ?? '',
        avatarUrl: member.avatarUrl ?? '',
        birthDate: member.birthDate ? member.birthDate.slice(0, 10) : '',
        showBirthDate: member.showBirthDate ?? false,
        dni: member.dni ?? '',
        address: member.address ?? '',
      });
    }
  }, [member, profileForm]);

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => membersApi.updateMe({
      displayName: data.displayName,
      realName: data.realName || undefined,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      showPhone: data.showPhone,
      discordHandle: data.discordHandle || undefined,
      avatarUrl: data.avatarUrl || undefined,
      birthDate: data.birthDate || undefined,
      showBirthDate: data.showBirthDate,
      dni: data.dni || undefined,
      address: data.address || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-me'] });
      navigate(ROUTES.MEMBER_ME);
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const [currentPwdStatus, setCurrentPwdStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [watchedCurrent, watchedNew, watchedConfirm] = passwordForm.watch(['currentPassword', 'newPassword', 'confirmPassword']);
  const passwordFormReady = currentPwdStatus === 'valid' && !!watchedNew && watchedNew.length >= 8 && watchedNew === watchedConfirm;

  useEffect(() => { setCurrentPwdStatus('idle'); }, [watchedCurrent]);

  const handleCurrentPasswordBlur = async () => {
    if (!watchedCurrent) return;
    setCurrentPwdStatus('checking');
    try {
      await authApi.verifyPassword(watchedCurrent);
      setCurrentPwdStatus('valid');
    } catch {
      setCurrentPwdStatus('invalid');
    }
  };

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      authApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setPasswordSuccess(true);
      passwordForm.reset();
      setCurrentPwdStatus('idle');
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: t('password_mismatch') });
      return;
    }
    passwordMutation.mutate(data);
  };

  if (isLoading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('edit_profile')}</h1>
        <Link to={ROUTES.MEMBER_ME} className="text-sm text-slate-400 hover:text-amber-300 transition-colors">
          {t('back_to_profile')}
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
      {/* Perfil */}
      <Card title={t('profile_information')}>
        <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="flex flex-col gap-3">
          {/* Avatar */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-800/50 flex items-center justify-center font-bold text-amber-200 text-xl shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                member?.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-300 rounded-md transition-colors text-left"
              >
                {uploading ? t('uploading') : t('upload_avatar')}
              </button>
              {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
              <div>
                <label className="block text-xs text-slate-500 mb-1">{t('or_enter_url')}</label>
                <Input {...profileForm.register('avatarUrl')} placeholder={t('avatar_url_placeholder')} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('display_name')} *</label>
              <Input {...profileForm.register('displayName', { required: true })} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('real_name')}</label>
              <Input {...profileForm.register('realName')} placeholder={t('real_name_placeholder')} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('bio')}</label>
            <textarea
              {...profileForm.register('bio')}
              rows={3}
              placeholder={t('bio_placeholder')}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('discord')}</label>
              <Input {...profileForm.register('discordHandle')} placeholder={t('discord_placeholder')} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('phone')}</label>
              <Input {...profileForm.register('phone')} placeholder={t('phone_placeholder')} type="tel" />
              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-xs text-slate-500">
                <input type="checkbox" {...profileForm.register('showPhone')} className="accent-amber-600" />
                {t('show_phone')}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('birth_date')}</label>
              <Input type="date" {...profileForm.register('birthDate')} />
              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-xs text-slate-500">
                <input type="checkbox" {...profileForm.register('showBirthDate')} className="accent-amber-600" />
                {t('show_birth_date')}
              </label>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('dni')}</label>
              <Input {...profileForm.register('dni')} placeholder={t('dni_placeholder')} />
              <p className="text-xs text-slate-600 mt-1">{t('admin_only')}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('address')}</label>
            <textarea
              {...profileForm.register('address')}
              rows={2}
              placeholder={t('address_placeholder')}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-y"
            />
            <p className="text-xs text-slate-600 mt-1">{t('admin_only')}</p>
          </div>

          {profileMutation.isError && (
            <p className="text-red-400 text-sm">{t('save_error')}</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" loading={profileMutation.isPending} disabled={!profileForm.formState.isDirty}>
              {t('save_changes')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Contraseña */}
      <Card title={t('change_password')}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('current_password')}</label>
            <Input
              type="password"
              {...passwordForm.register('currentPassword', { required: true })}
              placeholder={t('current_password_placeholder')}
              onBlur={handleCurrentPasswordBlur}
            />
            {currentPwdStatus === 'checking' && <p className="text-slate-400 text-xs mt-1">…</p>}
            {currentPwdStatus === 'invalid' && <p className="text-red-400 text-xs mt-1">{t('current_password_invalid')}</p>}
            {currentPwdStatus === 'valid' && <p className="text-green-400 text-xs mt-1">✓</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('new_password')}</label>
            <Input
              type="password"
              {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
              placeholder={t('new_password_placeholder')}
            />
            {passwordForm.formState.errors.newPassword?.type === 'minLength' && (
              <p className="text-red-400 text-xs mt-1">{t('password_min_length')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('confirm_password')}</label>
            <Input
              type="password"
              {...passwordForm.register('confirmPassword', { required: true })}
              placeholder={t('confirm_password_placeholder')}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {passwordMutation.isError && (
            <p className="text-red-400 text-sm">
              {(passwordMutation.error as any)?.response?.data?.message ?? t('password_change_error')}
            </p>
          )}

          {passwordSuccess && (
            <p className="text-green-400 text-sm">{t('password_changed')}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={passwordMutation.isPending} disabled={!passwordFormReady}>
              {t('change_password')}
            </Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}

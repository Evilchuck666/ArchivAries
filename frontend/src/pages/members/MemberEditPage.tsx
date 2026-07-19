import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../../api/members.api';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';
import { DateInput } from '../../components/ui/DateInput';
import { ROUTES } from '../../router/routes';
import type { MemberStatus } from '../../types/member.types';

const MEMBER_STATUSES: MemberStatus[] = ['ACTIVE', 'INACTIVE', 'ALUMNI', 'COLLABORATOR'];

interface FormData {
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
  status: MemberStatus;
  rank: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function MemberEditPage() {
  const { id } = useParams<{ id?: string }>();
  const isAdminEdit = !!id;

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
      form.setValue('avatarUrl', updated.avatarUrl ?? '', { shouldDirty: true });
    } catch {
      setUploadError(t('upload_error'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const { data: member, isLoading } = useQuery({
    queryKey: isAdminEdit ? ['member', id] : ['member-me'],
    queryFn: isAdminEdit ? () => membersApi.getOne(id!) : membersApi.getMe,
  });

  const form = useForm<FormData>();
  const avatarUrl = form.watch('avatarUrl');

  useEffect(() => {
    if (member) {
      form.reset({
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
        status: member.status,
        rank: member.rank ?? '',
      });
    }
  }, [member, form]);

  const backTo = isAdminEdit ? `/app/members/${id}` : ROUTES.MEMBER_ME;

  const profileMutation = useMutation({
    mutationFn: (data: FormData) => {
      const base = {
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
      };
      if (isAdminEdit) {
        return membersApi.update(id!, {
          ...base,
          status: data.status,
          rank: data.rank || undefined,
        });
      }
      return membersApi.updateMe(base);
    },
    onSuccess: () => {
      if (isAdminEdit) {
        queryClient.invalidateQueries({ queryKey: ['member', id] });
        queryClient.invalidateQueries({ queryKey: ['members'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['member-me'] });
      }
      navigate(backTo);
    },
  });

  // Password — only used in self mode
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
  if (!member && isAdminEdit) return <p className="text-slate-500">{t('not_found')}</p>;

  return (
    <div className={isAdminEdit ? 'max-w-2xl mx-auto' : 'max-w-5xl mx-auto'}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">
          {isAdminEdit ? t('edit_member') : t('edit_profile')}
        </h1>
        <Link to={backTo} className="text-sm text-slate-400 hover:text-amber-300 transition-colors">
          {isAdminEdit ? t('back_to_member') : t('back_to_profile')}
        </Link>
      </div>

      <div className={isAdminEdit ? 'flex flex-col gap-6' : 'grid md:grid-cols-2 gap-6 items-start'}>
        {/* Perfil */}
        <Card title={t('profile_information')}>
          <form onSubmit={form.handleSubmit((d) => profileMutation.mutate(d))} className="flex flex-col gap-3">
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
                {!isAdminEdit && (
                  <>
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
                  </>
                )}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    {isAdminEdit ? t('avatar_url') : t('or_enter_url')}
                  </label>
                  <Input {...form.register('avatarUrl')} placeholder={t('avatar_url_placeholder')} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t('display_name')} *</label>
                <Input {...form.register('displayName', { required: true })} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t('real_name')}</label>
                <Input {...form.register('realName')} placeholder={t('real_name_placeholder')} />
              </div>
            </div>

            {/* Estado y rango — solo en modo admin */}
            {isAdminEdit && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('status')}</label>
                  <select
                    {...form.register('status')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    {MEMBER_STATUSES.map((s) => (
                      <option key={s} value={s}>{tc(`status.${s}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('rank')}</label>
                  <Input {...form.register('rank')} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('bio')}</label>
              <MarkdownEditor
                {...form.register('bio')}
                rows={3}
                placeholder={t('bio_placeholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t('discord')}</label>
                <Input {...form.register('discordHandle')} placeholder={t('discord_placeholder')} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t('phone')}</label>
                <Input {...form.register('phone')} placeholder={t('phone_placeholder')} type="tel" />
                <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-xs text-slate-500">
                  <input type="checkbox" {...form.register('showPhone')} className="accent-amber-600" />
                  {t('show_phone')}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Controller
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <DateInput label={t('birth_date')} value={field.value} onChange={field.onChange} />
                  )}
                />
                <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-xs text-slate-500">
                  <input type="checkbox" {...form.register('showBirthDate')} className="accent-amber-600" />
                  {t('show_birth_date')}
                </label>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t('dni')}</label>
                <Input {...form.register('dni')} placeholder={t('dni_placeholder')} />
                {!isAdminEdit && <p className="text-xs text-slate-600 mt-1">{t('admin_only')}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('address')}</label>
              <textarea
                {...form.register('address')}
                rows={2}
                placeholder={t('address_placeholder')}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-y"
              />
              {!isAdminEdit && <p className="text-xs text-slate-600 mt-1">{t('admin_only')}</p>}
            </div>

            {profileMutation.isError && (
              <p className="text-red-400 text-sm">{t('save_error')}</p>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <Button type="button" variant="ghost" onClick={() => navigate(backTo)}>
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" loading={profileMutation.isPending} disabled={!form.formState.isDirty}>
                {t('save_changes')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Contraseña — solo en modo propio */}
        {!isAdminEdit && (
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
                  {t('password_change_error')}
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
        )}
      </div>
    </div>
  );
}

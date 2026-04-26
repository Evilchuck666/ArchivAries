import { useEffect, useState } from 'react';
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
  discordHandle: string;
  avatarUrl: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function MemberEditPage() {
  const { t } = useTranslation(['members', 'common']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
        realName: (member as any).realName ?? '',
        bio: member.bio ?? '',
        phone: (member as any).phone ?? '',
        discordHandle: member.discordHandle ?? '',
        avatarUrl: member.avatarUrl ?? '',
      });
    }
  }, [member, profileForm]);

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => membersApi.updateMe({
      displayName: data.displayName,
      realName: data.realName || undefined,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      discordHandle: data.discordHandle || undefined,
      avatarUrl: data.avatarUrl || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-me'] });
      navigate(ROUTES.MEMBER_ME);
    },
  });

  const passwordForm = useForm<PasswordFormData>();

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      authApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setPasswordSuccess(true);
      passwordForm.reset();
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Las contraseñas no coinciden' });
      return;
    }
    passwordMutation.mutate(data);
  };

  if (isLoading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-amber-200">{t('edit_profile')}</h1>
        <Link to={ROUTES.MEMBER_ME} className="text-sm text-slate-400 hover:text-amber-300 transition-colors">
          ← Volver al perfil
        </Link>
      </div>

      {/* Perfil */}
      <Card title="Información del perfil">
        <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-800/50 flex items-center justify-center font-bold text-amber-200 text-xl shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                member?.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">URL del avatar</label>
              <Input {...profileForm.register('avatarUrl')} placeholder="https://ejemplo.com/avatar.jpg" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('display_name')} *</label>
            <Input {...profileForm.register('displayName', { required: true })} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('real_name')}</label>
            <Input {...profileForm.register('realName')} placeholder="Tu nombre real" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('bio')}</label>
            <textarea
              {...profileForm.register('bio')}
              rows={4}
              placeholder="Cuéntanos algo sobre ti..."
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('discord')}</label>
              <Input {...profileForm.register('discordHandle')} placeholder="nombreusuario" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('phone')}</label>
              <Input {...profileForm.register('phone')} placeholder="+34 600 000 000" type="tel" />
            </div>
          </div>

          {profileMutation.isError && (
            <p className="text-red-400 text-sm">Ha ocurrido un error al guardar.</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" loading={profileMutation.isPending}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>

      {/* Contraseña */}
      <Card title="Cambiar contraseña">
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Contraseña actual</label>
            <Input
              type="password"
              {...passwordForm.register('currentPassword', { required: true })}
              placeholder="Tu contraseña actual"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Nueva contraseña</label>
            <Input
              type="password"
              {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
              placeholder="Mínimo 8 caracteres"
            />
            {passwordForm.formState.errors.newPassword?.type === 'minLength' && (
              <p className="text-red-400 text-xs mt-1">Mínimo 8 caracteres</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Confirmar nueva contraseña</label>
            <Input
              type="password"
              {...passwordForm.register('confirmPassword', { required: true })}
              placeholder="Repite la nueva contraseña"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {passwordMutation.isError && (
            <p className="text-red-400 text-sm">
              {(passwordMutation.error as any)?.response?.data?.message ?? 'Error al cambiar la contraseña'}
            </p>
          )}

          {passwordSuccess && (
            <p className="text-green-400 text-sm">Contraseña cambiada correctamente.</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={passwordMutation.isPending}>
              Cambiar contraseña
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

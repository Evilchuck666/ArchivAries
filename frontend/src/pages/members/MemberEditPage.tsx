import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../../api/members.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ROUTES } from '../../router/routes';

interface FormData {
  displayName: string;
  bio: string;
  discordHandle: string;
  avatarUrl: string;
}

export function MemberEditPage() {
  const { t } = useTranslation(['members', 'common']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member-me'],
    queryFn: membersApi.getMe,
  });

  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const avatarUrl = watch('avatarUrl');

  useEffect(() => {
    if (member) {
      reset({
        displayName: member.displayName,
        bio: member.bio ?? '',
        discordHandle: member.discordHandle ?? '',
        avatarUrl: member.avatarUrl ?? '',
      });
    }
  }, [member, reset]);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: FormData) => membersApi.updateMe({
      displayName: data.displayName,
      bio: data.bio || undefined,
      discordHandle: data.discordHandle || undefined,
      avatarUrl: data.avatarUrl || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-me'] });
      navigate(ROUTES.MEMBER_ME);
    },
  });

  if (isLoading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('edit_profile')}</h1>
        <Link to={ROUTES.MEMBER_ME} className="text-sm text-slate-400 hover:text-amber-300 transition-colors">
          ← Volver al perfil
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-5">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-800/50 flex items-center justify-center font-bold text-amber-200 text-xl shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                member?.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">URL del avatar</label>
              <Input
                {...register('avatarUrl')}
                placeholder="https://ejemplo.com/avatar.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('display_name')} *</label>
            <Input {...register('displayName', { required: true })} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('bio')}</label>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Cuéntanos algo sobre ti..."
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('discord')}</label>
            <Input {...register('discordHandle')} placeholder="nombreusuario" />
          </div>

          {isError && (
            <p className="text-red-400 text-sm">Ha ocurrido un error al guardar. Inténtalo de nuevo.</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" loading={isPending}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { t } = useTranslation('members');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member-me'],
    queryFn: membersApi.getMe,
  });

  const { register, handleSubmit, reset } = useForm<FormData>();

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

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => membersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-me'] });
      navigate(ROUTES.MEMBER_ME);
    },
  });

  if (isLoading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('edit_profile')}</h1>
      <Card>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
          <Input label={t('display_name')} {...register('displayName', { required: true })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">{t('bio')}</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
            />
          </div>
          <Input label={t('discord')} {...register('discordHandle')} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
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

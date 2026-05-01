import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../../api/members.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';
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

export function MemberAdminEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('members');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getOne(id!),
    enabled: !!id,
  });

  const form = useForm<FormData>();

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

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      membersApi.update(id!, {
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
        status: data.status,
        rank: data.rank || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      navigate(`/app/members/${id}`);
    },
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!member) return <p className="text-slate-500">{t('not_found')}</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('edit_member')}</h1>
        <Link
          to={`/app/members/${id}`}
          className="text-sm text-slate-400 hover:text-amber-300 transition-colors"
        >
          {t('back_to_member')}
        </Link>
      </div>

      <Card title={t('profile_information')}>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('avatar_url')}</label>
            <Input {...form.register('avatarUrl')} placeholder={t('avatar_url_placeholder')} />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('status')}</label>
              <select
                {...form.register('status')}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                {MEMBER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {tc(`status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('rank')}</label>
              <Input {...form.register('rank')} />
            </div>
          </div>

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
              <label className="block text-sm text-slate-400 mb-1">{t('birth_date')}</label>
              <Input type="date" {...form.register('birthDate')} />
              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-xs text-slate-500">
                <input type="checkbox" {...form.register('showBirthDate')} className="accent-amber-600" />
                {t('show_birth_date')}
              </label>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('dni')}</label>
              <Input {...form.register('dni')} placeholder={t('dni_placeholder')} />
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
          </div>

          {mutation.isError && (
            <p className="text-red-400 text-sm">{t('save_error')}</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/app/members/${id}`)}
            >
              {tc('actions.cancel')}
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={!form.formState.isDirty}
            >
              {t('save_changes')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

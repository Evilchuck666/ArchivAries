import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../../api/members.api';
import { MemberStatusBadge } from '../../components/shared/MemberStatusBadge';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Role } from '../../types/auth.types';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('members');

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getOne(id!),
    enabled: !!id,
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!member) return <p className="text-slate-500">{t('not_found')}</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/app/members" className="text-sm text-slate-400 hover:text-amber-300 mb-6 inline-block">
        {t('back_to_members')}
      </Link>

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.displayName} className="w-16 h-16 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-800/50 flex items-center justify-center font-bold text-amber-200 text-2xl shrink-0">
              {member.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-serif text-amber-200">{member.displayName}</h1>
            {member.rank && <p className="text-amber-600 text-sm">{member.rank}</p>}
            <div className="flex gap-2 mt-1 flex-wrap">
              <MemberStatusBadge status={member.status} />
              {member.user?.role && <RoleBadge role={member.user.role as Role} />}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {member.bio && (
          <Card title={t('bio')}>
            <p className="text-slate-300 text-sm leading-relaxed">{member.bio}</p>
          </Card>
        )}

        <Card title={t('information')}>
          <dl className="grid gap-2">
            {member.realName && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('real_name')}</dt>
                <dd className="text-slate-300">{member.realName}</dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">{t('joined')}</dt>
              <dd className="text-slate-300">{format(new Date(member.joinedAt), 'd MMMM yyyy', { locale: es })}</dd>
            </div>
            {member.discordHandle && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('discord')}</dt>
                <dd className="text-slate-300">{member.discordHandle}</dd>
              </div>
            )}
            {member.phone && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('phone')}</dt>
                <dd className="text-slate-300">{member.phone}</dd>
              </div>
            )}
            {member.birthDate && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('birth_date')}</dt>
                <dd className="text-slate-300">{format(new Date(member.birthDate), 'd MMMM yyyy', { locale: es })}</dd>
              </div>
            )}
            {member.dni && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('dni')}</dt>
                <dd className="text-slate-300">{member.dni}</dd>
              </div>
            )}
            {member.address && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('address')}</dt>
                <dd className="text-slate-300 text-right max-w-[60%]">{member.address}</dd>
              </div>
            )}
          </dl>
        </Card>

        {member.notes && (
          <Card title={t('notes')}>
            <p className="text-slate-300 text-sm leading-relaxed">{member.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

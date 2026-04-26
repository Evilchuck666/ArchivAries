import { Link } from 'react-router-dom';
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

export function MemberProfilePage() {
  const { t } = useTranslation('members');

  const { data: member, isLoading } = useQuery({
    queryKey: ['member-me'],
    queryFn: membersApi.getMe,
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!member) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-slate-400 mb-4">No tienes una ficha de miembro todavía.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/app/members" className="text-sm text-slate-400 hover:text-amber-300 transition-colors">
          ← {t('title')}
        </Link>
        <Link
          to="/app/members/me/edit"
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-3 py-1.5 rounded-md transition-colors border border-amber-500"
        >
          {t('edit_profile')}
        </Link>
      </div>

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

      {member.bio && (
        <Card title={t('bio')} className="mb-4">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{member.bio}</p>
        </Card>
      )}

      <Card title="Información">
        <dl className="grid gap-3">
          {member.realName && (
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">{t('real_name')}</dt>
              <dd className="text-slate-300">{member.realName}</dd>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">{t('joined')}</dt>
            <dd className="text-slate-300">{format(new Date(member.joinedAt), "d 'de' MMMM yyyy", { locale: es })}</dd>
          </div>
          {member.discordHandle && (
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">{t('discord')}</dt>
              <dd className="text-slate-300">{member.discordHandle}</dd>
            </div>
          )}
          {member.user?.email && (
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">{t('email')}</dt>
              <dd className="text-slate-300">{member.user.email}</dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}

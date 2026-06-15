import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../../api/members.api';
import { MemberStatusBadge } from '../../components/shared/MemberStatusBadge';
import { RoleBadge } from '../../components/shared/RoleBadge';
import type { Role } from '../../types/auth.types';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { MemberStatus } from '../../types/member.types';

const STATUSES: MemberStatus[] = ['ACTIVE', 'INACTIVE', 'ALUMNI', 'COLLABORATOR'];

export function MemberListPage() {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', search, status],
    queryFn: () => membersApi.getAll(search || undefined, status || undefined),
    staleTime: 30_000,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('title')}</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Input
          placeholder={t('search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">{t('all_statuses')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{tCommon(`status.${s}`)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner className="py-20" />
      ) : members.length === 0 ? (
        <EmptyState title={t('no_members')} icon={<span className="text-5xl">🛡️</span>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Link
              key={member.id}
              to={`/app/members/${member.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-amber-800 rounded-lg p-4 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-800/50 flex items-center justify-center font-bold text-amber-200 text-sm shrink-0 overflow-hidden">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                  ) : (
                    member.displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-200 group-hover:text-amber-300 transition-colors truncate">{member.displayName}</p>
                  {member.rank && <p className="text-xs text-amber-600 truncate">{member.rank}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <MemberStatusBadge status={member.status} />
                {member.user?.role && <RoleBadge role={member.user.role as Role} />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

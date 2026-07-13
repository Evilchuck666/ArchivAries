import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../../api/members.api';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { MemberStatusBadge } from '../../components/shared/MemberStatusBadge';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';
import { Spinner } from '../../components/ui/Spinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Role } from '../../types/auth.types';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('members');
  const { t: tc } = useTranslation('common');
  const { user } = useAuthStore();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const isMeRoute = id === 'me';

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', isMeRoute ? 'me' : id],
    queryFn: isMeRoute ? membersApi.getMe : () => membersApi.getOne(id!),
    enabled: isMeRoute || !!id,
  });

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  const { mutate: saveNotes, isPending: savingNotes } = useMutation({
    mutationFn: (notes: string) => membersApi.updateNotes(member!.id, notes),
    onSuccess: () => {
      setEditingNotes(false);
      queryClient.invalidateQueries({ queryKey: ['member', isMeRoute ? 'me' : id] });
    },
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!member) return <p className="text-slate-500">{t('not_found')}</p>;

  const isSelf = isMeRoute || member.userId === user?.id;
  const isAdmin = can('members.read_sensitive');
  const canEditNotes = can('members.edit_notes');
  const canEditMember = can('members.edit_any') && !isSelf;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/app/members" className="text-sm text-slate-400 hover:text-amber-300 transition-colors">
          ← {t('title')}
        </Link>
        <div className="flex gap-2">
          {isSelf && (
            <Link
              to="/app/members/me/edit"
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-3 py-1.5 rounded-md transition-colors border border-amber-500"
            >
              {t('edit_profile')}
            </Link>
          )}
          {canEditMember && (
            <Link
              to={`/app/members/${member.id}/edit`}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded-md transition-colors border border-slate-600"
            >
              {t('edit_member')}
            </Link>
          )}
        </div>
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
            {(member.rank || isAdmin) && (
              <p className={member.rank ? 'text-amber-600 text-sm' : 'text-slate-600 italic text-sm'}>
                {member.rank || t('not_set')}
              </p>
            )}
            <div className="flex gap-2 mt-1 flex-wrap">
              <MemberStatusBadge status={member.status} />
              {member.user?.role && <RoleBadge role={member.user.role as Role} />}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {(member.bio || isAdmin) && (
          <Card title={t('bio')}>
            {member.bio
              ? <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{member.bio}</p>
              : <p className="text-slate-600 italic text-sm">{t('not_set')}</p>
            }
          </Card>
        )}

        <Card title={t('information')}>
          <dl className="grid gap-3">
            {(member.realName || isAdmin) && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('real_name')}</dt>
                <dd className={member.realName ? 'text-slate-300' : 'text-slate-600 italic'}>
                  {member.realName || t('not_set')}
                </dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">{t('joined')}</dt>
              <dd className="text-slate-300">{format(new Date(member.joinedAt), "d 'de' MMMM yyyy", { locale: es })}</dd>
            </div>
            {(member.discordHandle || isAdmin) && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('discord')}</dt>
                <dd className={member.discordHandle ? 'text-slate-300' : 'text-slate-600 italic'}>
                  {member.discordHandle || t('not_set')}
                </dd>
              </div>
            )}
            {(member.phone || isAdmin) && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('phone')}</dt>
                <dd className={member.phone ? 'text-slate-300' : 'text-slate-600 italic'}>
                  {member.phone || t('not_set')}
                </dd>
              </div>
            )}
            {(member.birthDate || isAdmin) && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('birth_date')}</dt>
                <dd className={member.birthDate ? 'text-slate-300' : 'text-slate-600 italic'}>
                  {member.birthDate
                    ? format(new Date(member.birthDate), "d 'de' MMMM yyyy", { locale: es })
                    : t('not_set')}
                </dd>
              </div>
            )}
            {(member.dni || isAdmin) && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('dni')}</dt>
                <dd className={member.dni ? 'text-slate-300' : 'text-slate-600 italic'}>
                  {member.dni || t('not_set')}
                </dd>
              </div>
            )}
            {(member.address || isAdmin) && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('address')}</dt>
                <dd className={`${member.address ? 'text-slate-300' : 'text-slate-600 italic'} text-right max-w-[60%]`}>
                  {member.address || t('not_set')}
                </dd>
              </div>
            )}
            {(isSelf || isAdmin) && member.user !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('email')}</dt>
                <dd className="text-slate-300">{member.user.email}</dd>
              </div>
            )}
            {isAdmin && member.user !== undefined && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">{t('account_status')}</dt>
                <dd className={member.user.isActive ? 'text-green-400' : 'text-red-400'}>
                  {member.user.isActive ? tc('status.active') : tc('status.inactive')}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {canEditNotes && (
          <Card
            title={t('notes')}
            action={
              canEditNotes && !editingNotes ? (
                <button
                  onClick={() => { setNotesValue(member.notes ?? ''); setEditingNotes(true); }}
                  className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
                >
                  {tc('actions.edit')}
                </button>
              ) : undefined
            }
          >
            {editingNotes ? (
              <div className="flex flex-col gap-2">
                <MarkdownEditor
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={4}
                  autoFocus
                  placeholder={t('notes_placeholder')}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setEditingNotes(false)}>
                    {tc('actions.cancel')}
                  </Button>
                  <Button size="sm" loading={savingNotes} onClick={() => saveNotes(notesValue)}>
                    {tc('actions.save')}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {member.notes || <span className="text-slate-600 italic">{t('notes_placeholder')}</span>}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

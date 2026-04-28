import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usersApi } from '../../api/users.api';
import { Spinner } from '../../components/ui/Spinner';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { ConfirmStatusModal } from '../../components/shared/ConfirmStatusModal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import type { Role } from '../../types/auth.types';

const ROLES: Role[] = ['VISITOR', 'MEMBER', 'AREA_MANAGER', 'BOARD', 'ADMIN', 'SUPER_ADMIN'];
const ROLE_HIERARCHY: Role[] = ['VISITOR', 'MEMBER', 'AREA_MANAGER', 'BOARD', 'ADMIN', 'SUPER_ADMIN'];

export function UserManagementPage() {
  const { t } = useTranslation('common');
  const { t: ta } = useTranslation('admin');
  const { user: me } = useAuthStore();
  const queryClient = useQueryClient();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('MEMBER');
  const [inviteSuccess, setInviteSuccess] = useState<{ email: string; devUrl: string } | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [pendingStatus, setPendingStatus] = useState<{ id: string; email: string; currentIsActive: boolean } | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersApi.getAll,
    staleTime: 30_000,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive, reason }: { id: string; isActive: boolean; reason: string }) =>
      usersApi.updateStatus(id, isActive, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setPendingStatus(null);
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => usersApi.invite(inviteEmail, inviteRole),
    onSuccess: (data) => {
      setInviteSuccess({ email: data.email, devUrl: data.devActivationUrl });
      setInviteEmail('');
      setInviteRole('MEMBER');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      setInviteError(status === 409 ? ta('invite_error_conflict') : ta('invite_error_generic'));
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess(null);
    inviteMutation.mutate();
  };

  const isSuperAdmin = me && ROLE_HIERARCHY.indexOf(me.role) >= ROLE_HIERARCHY.indexOf('SUPER_ADMIN');

  if (isLoading) return <Spinner className="py-20" />;

  return (
    <>
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-serif text-amber-200">{t('admin.users')}</h1>
          <span className="text-sm text-slate-500">({users.length})</span>
        </div>
        <button
          onClick={() => { setShowInvite(!showInvite); setInviteSuccess(null); setInviteError(''); }}
          className="text-sm px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-md transition-colors border border-amber-600"
        >
          {ta('invite_user')}
        </button>
      </div>

      {showInvite && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6">
          <form onSubmit={handleInviteSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">{ta('invite_email_label')}</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">{ta('invite_role_label')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {ROLES.filter((r) => r !== 'SUPER_ADMIN').map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            {inviteError && (
              <p className="text-red-400 text-sm">{inviteError}</p>
            )}
            {inviteSuccess && (
              <div className="text-sm space-y-1">
                <p className="text-green-400">{ta('invite_success', { email: inviteSuccess.email })}</p>
                <p className="text-slate-500 text-xs">{ta('invite_dev_url')}</p>
                <code className="block text-xs text-amber-300 bg-slate-800 rounded px-2 py-1 break-all">
                  {inviteSuccess.devUrl}
                </code>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => { setShowInvite(false); setInviteSuccess(null); }}>
                {ta('invite_cancel')}
              </Button>
              <Button type="submit" loading={inviteMutation.isPending} disabled={!inviteEmail}>
                {ta('invite_send')}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">{t('fields.user')}</th>
              <th className="text-left px-4 py-3">{t('fields.email')}</th>
              <th className="text-left px-4 py-3">{t('fields.role')}</th>
              <th className="text-left px-4 py-3">{t('fields.status')}</th>
              <th className="text-left px-4 py-3">{t('fields.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === me?.id;
              const canChangeRole = isSuperAdmin || (me && ROLE_HIERARCHY.indexOf(me.role) > ROLE_HIERARCHY.indexOf(u.role));

              return (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.member?.avatarUrl ? (
                        <img src={u.member.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                          {(u.member?.displayName ?? u.email)[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-slate-200">{u.member?.displayName ?? '—'}</span>
                      {isSelf && <span className="text-xs text-amber-600">({t('roles.you')})</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    {canChangeRole && !isSelf ? (
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as Role })}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={u.role} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.isActive ? 'text-green-400' : 'text-slate-500'}`}>
                      {u.isActive ? t('status.active') : t('status.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && canChangeRole && (
                      <button
                        onClick={() => setPendingStatus({ id: u.id, email: u.email, currentIsActive: u.isActive })}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          u.isActive
                            ? 'border-red-800 text-red-400 hover:bg-red-900/30'
                            : 'border-green-800 text-green-400 hover:bg-green-900/30'
                        }`}
                      >
                        {u.isActive ? t('actions.deactivate') : t('actions.activate')}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    {pendingStatus && (
      <ConfirmStatusModal
        email={pendingStatus.email}
        currentIsActive={pendingStatus.currentIsActive}
        onConfirm={(reason) => statusMutation.mutate({ id: pendingStatus.id, isActive: !pendingStatus.currentIsActive, reason })}
        onCancel={() => setPendingStatus(null)}
        isPending={statusMutation.isPending}
      />
    )}
    </>
  );
}

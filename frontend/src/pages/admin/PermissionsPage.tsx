import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { permissionsApi } from '../../api/permissions.api';
import { rolesApi } from '../../api/roles.api';
import { Spinner } from '../../components/ui/Spinner';

const GROUP_ORDER = ['events', 'calendar', 'lore', 'documents', 'news', 'members', 'users', 'permissions', 'roles'];

export function PermissionsPage() {
  const { t } = useTranslation('permissions');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['permissions-matrix'],
    queryFn: permissionsApi.getAll,
    staleTime: 0,
  });

  const { data: roleDefinitions = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
    staleTime: 60_000,
  });

  const rows = response?.matrix ?? [];
  const protectedRoles = response?.protectedRoles ?? [];
  const ROLES = roleDefinitions.map((r) => r.name);

  const matrix = new Map<string, boolean>();
  for (const row of rows) {
    matrix.set(`${row.role}:${row.permission}`, row.granted);
  }

  const allPermissions = [...new Set(rows.map((r) => r.permission))].sort();
  const groupMap = new Map<string, string[]>();
  for (const perm of allPermissions) {
    const group = perm.split('.')[0];
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(perm);
  }
  const groups = [
    ...GROUP_ORDER.filter((g) => groupMap.has(g)),
    ...[...groupMap.keys()].filter((g) => !GROUP_ORDER.includes(g)).sort(),
  ].map((key) => ({ key, permissions: groupMap.get(key)! }));

  const toggleMutation = useMutation({
    mutationFn: ({ role, permission, granted }: { role: string; permission: string; granted: boolean }) =>
      permissionsApi.setPermission(role, permission, granted),
    onMutate: ({ role, permission }) => {
      setSavingKey(`${role}:${permission}`);
      setErrorKey(null);
    },
    onSuccess: () => {
      setSavingKey(null);
      queryClient.invalidateQueries({ queryKey: ['permissions-matrix'] });
    },
    onError: (_, { role, permission }) => {
      setSavingKey(null);
      setErrorKey(`${role}:${permission}`);
    },
  });

  const handleToggle = (role: string, permission: string, currentGranted: boolean) => {
    if (protectedRoles.includes(role)) return;
    toggleMutation.mutate({ role, permission, granted: !currentGranted });
  };

  if (isLoading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('title')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 text-slate-400 font-medium min-w-48 sticky left-0 bg-slate-950 z-10">
                {tc('nav.permissions', { defaultValue: 'Permiso' })}
              </th>
              {ROLES.map((role) => {
                const roleDef = roleDefinitions.find((r) => r.name === role);
                return (
                  <th key={role} className="text-center py-2 px-3 text-slate-400 font-medium min-w-24">
                    <span className={protectedRoles.includes(role) ? 'text-amber-500' : ''}>
                      {tc(`roles.${role}`, { defaultValue: roleDef?.label ?? role })}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <>
                <tr key={`group-${group.key}`}>
                  <td
                    colSpan={ROLES.length + 1}
                    className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-amber-600"
                  >
                    {t(`groups.${group.key}`, { defaultValue: group.key })}
                  </td>
                </tr>
                {group.permissions.map((permission) => (
                  <tr key={permission} className="border-t border-slate-800/50 hover:bg-slate-900/50">
                    <td className="py-2 pr-4 text-slate-300 sticky left-0 bg-transparent z-10">
                      {t(`permissions.${permission}`, { defaultValue: permission })}
                    </td>
                    {ROLES.map((role) => {
                      const cellKey = `${role}:${permission}`;
                      const granted = matrix.get(cellKey) ?? false;
                      const isSaving = savingKey === cellKey;
                      const hasError = errorKey === cellKey;
                      const isProtected = protectedRoles.includes(role);

                      return (
                        <td key={role} className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(role, permission, granted)}
                            disabled={isProtected || isSaving}
                            title={isProtected ? t('protected_role') : undefined}
                            className={`w-8 h-5 rounded-full transition-colors relative inline-flex items-center ${
                              isProtected
                                ? 'bg-amber-700/50 cursor-default'
                                : granted
                                ? 'bg-amber-600 hover:bg-amber-500'
                                : 'bg-slate-700 hover:bg-slate-600'
                            } ${isSaving ? 'opacity-50' : ''} ${hasError ? 'ring-1 ring-red-500' : ''}`}
                          >
                            <span
                              className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                                granted || isProtected ? 'translate-x-3.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {errorKey && (
        <p className="text-red-400 text-sm mt-4">{t('save_error')}</p>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { rolesApi } from '../../api/roles.api';
import type { RoleDefinition } from '../../api/roles.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface RoleFormData {
  name: string;
  label: string;
  level: number;
}

const EMPTY_FORM: RoleFormData = { name: '', label: '', level: 25 };

export function RolesPage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoleFormData>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<{ label: string; level: number }>({ label: '', level: 0 });
  const [error, setError] = useState('');

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setError('');
    },
    onError: () => {
      setError(t('roles_create_error'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { label: string; level: number } }) =>
      rolesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingId(null);
    },
    onError: () => {
      setError(t('roles_update_error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rolesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['permissions-matrix'] });
    },
    onError: () => {
      setError(t('roles_delete_error'));
    },
  });

  const startEdit = (role: RoleDefinition) => {
    setEditingId(role.id);
    setEditForm({ label: role.label, level: role.level });
    setError('');
  };

  if (isLoading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-amber-200">{t('roles_title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('roles_subtitle')}</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setError(''); }}>
          {t('roles_create')}
        </Button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {showCreate && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-slate-300 mb-3">{t('roles_create')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">{t('roles_field_name')}</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))}
                placeholder="NUEVO_ROL"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{t('roles_field_label')}</label>
              <Input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder={t('roles_field_label_placeholder')}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{t('roles_field_level')}</label>
              <Input
                type="number"
                value={form.level}
                min={1}
                max={999}
                onChange={(e) => setForm((f) => ({ ...f, level: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}>
              {tc('actions.cancel')}
            </Button>
            <Button
              loading={createMutation.isPending}
              disabled={!form.name || !form.label || form.level <= 0}
              onClick={() => createMutation.mutate(form)}
            >
              {tc('actions.save')}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">{t('roles_field_name')}</th>
              <th className="text-left px-4 py-3">{t('roles_field_label')}</th>
              <th className="text-left px-4 py-3">{t('roles_field_level')}</th>
              <th className="text-left px-4 py-3">{tc('fields.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-amber-300">{role.name}</span>
                  {role.isProtected && (
                    <span className="ml-2 text-xs text-slate-500">{t('roles_protected')}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === role.id ? (
                    <Input
                      value={editForm.label}
                      onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                      className="text-sm py-1"
                    />
                  ) : (
                    <span className="text-slate-200">{role.label}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === role.id ? (
                    <Input
                      type="number"
                      value={editForm.level}
                      min={1}
                      max={999}
                      onChange={(e) => setEditForm((f) => ({ ...f, level: parseInt(e.target.value) || 0 }))}
                      className="text-sm py-1 w-24"
                    />
                  ) : (
                    <span className="text-slate-400">{role.level}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {role.isProtected ? (
                    <span className="text-xs text-slate-600">—</span>
                  ) : editingId === role.id ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: role.id, payload: editForm })}
                      >
                        {tc('actions.save')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        {tc('actions.cancel')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(role)}
                        className="text-xs text-amber-400 hover:text-amber-300"
                      >
                        {tc('actions.edit')}
                      </button>
                      <button
                        onClick={() => {
                          setError('');
                          deleteMutation.mutate(role.id);
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        {tc('actions.delete')}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

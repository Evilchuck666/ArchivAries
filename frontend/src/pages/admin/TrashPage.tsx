import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { trashApi } from '../../api/trash.api';
import type { TrashItem } from '../../api/trash.api';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmActionModal } from '../../components/ui/ConfirmActionModal';
import { usePermissions } from '../../hooks/usePermissions';

const TABLE_NAMES = ['events', 'documents', 'news_announcements', 'lore_entries'] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function TrashPage() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [tableFilter, setTableFilter] = useState<string | undefined>(undefined);
  const [pendingPurge, setPendingPurge] = useState<TrashItem | null>(null);
  const [showPurgeExpired, setShowPurgeExpired] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['trash', tableFilter],
    queryFn: () => trashApi.getAll(tableFilter),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => trashApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trash'] }),
  });

  const purgeMutation = useMutation({
    mutationFn: (id: string) => trashApi.permanentDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      setPendingPurge(null);
    },
  });

  const purgeExpiredMutation = useMutation({
    mutationFn: () => trashApi.purgeExpired(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      setShowPurgeExpired(false);
    },
  });

  const items = data?.items ?? [];

  const filterLabels: Record<string, string> = {
    events: t('trash_filter_events'),
    documents: t('trash_filter_documents'),
    news_announcements: t('trash_filter_news'),
    lore_entries: t('trash_filter_lore'),
  };

  const typeLabels: Record<string, string> = {
    events: t('trash_type_events'),
    documents: t('trash_type_documents'),
    news_announcements: t('trash_type_news_announcements'),
    lore_entries: t('trash_type_lore_entries'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-amber-200">{t('trash_title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('trash_subtitle')}</p>
        </div>
        {can('trash.purge') && (
          <button
            onClick={() => setShowPurgeExpired(true)}
            className="text-xs px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 rounded-md transition-colors"
          >
            {t('trash_purge_expired')}
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTableFilter(undefined)}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            tableFilter === undefined
              ? 'bg-amber-900/30 border-amber-700 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('trash_filter_all')}
        </button>
        {TABLE_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setTableFilter(name)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              tableFilter === name
                ? 'bg-amber-900/30 border-amber-700 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {filterLabels[name]}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500">{t('trash_empty')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="pb-3 pr-4 font-medium">{t('trash_col_title')}</th>
                <th className="pb-3 pr-4 font-medium">{t('trash_col_type')}</th>
                <th className="pb-3 pr-4 font-medium">{t('trash_col_deleted_by')}</th>
                <th className="pb-3 pr-4 font-medium">{t('trash_col_deleted_at')}</th>
                <th className="pb-3 pr-4 font-medium">{t('trash_col_expires_at')}</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {items.map((item) => (
                <tr key={item.id} className="text-slate-300">
                  <td className="py-3 pr-4 font-medium text-slate-100">{item.title}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                      {typeLabels[item.tableName] ?? item.tableName}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {item.deletedBy?.member?.displayName ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{formatDate(item.deletedAt)}</td>
                  <td className="py-3 pr-4 text-slate-400">{formatDate(item.expiresAt)}</td>
                  <td className="py-3">
                    <div className="flex gap-2 justify-end">
                      {can('trash.restore') && (
                        <button
                          onClick={() => restoreMutation.mutate(item.id)}
                          disabled={restoreMutation.isPending}
                          className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded transition-colors disabled:opacity-50"
                        >
                          {t('trash_restore')}
                        </button>
                      )}
                      {can('trash.purge') && (
                        <button
                          onClick={() => setPendingPurge(item)}
                          className="text-xs px-2 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 rounded transition-colors"
                        >
                          {t('trash_purge')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal purga individual */}
      <ConfirmActionModal
        isOpen={!!pendingPurge}
        message={t('trash_confirm_purge')}
        onConfirm={() => pendingPurge && purgeMutation.mutate(pendingPurge.id)}
        onCancel={() => setPendingPurge(null)}
        isPending={purgeMutation.isPending}
      />

      {/* Modal purga expirados */}
      <ConfirmActionModal
        isOpen={showPurgeExpired}
        message={t('trash_confirm_purge_expired')}
        onConfirm={() => purgeExpiredMutation.mutate()}
        onCancel={() => setShowPurgeExpired(false)}
        isPending={purgeExpiredMutation.isPending}
      />
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loreApi } from '../../api/lore.api';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { usePermissions } from '../../hooks/usePermissions';
import type { LoreCategory } from '../../types/lore.types';

const CATEGORY_ICONS: Record<LoreCategory, string> = {
  HISTORY: '📜', SYMBOLS: '🐐', ENEMIES: '⚔️', FACTIONS: '🏰',
  PLACES: '🗺️', CHARACTERS: '👤', CHRONICLES: '📖', OTHER: '📌',
};

export function LoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('lore');
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canEdit = can('lore.edit');

  const { data: entry, isLoading } = useQuery({
    queryKey: ['lore', id],
    queryFn: () => loreApi.getOne(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => loreApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lore'] });
      navigate('/app/lore');
    },
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!entry) return <p className="text-slate-400">{t('not_found')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
        <Link to="/app/lore" className="hover:text-amber-400 transition-colors">{t('title')}</Link>
        <span>/</span>
        <span className="text-amber-600">{CATEGORY_ICONS[entry.category]} {t(`categories.${entry.category}`)}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs text-amber-600 font-medium">
                {CATEGORY_ICONS[entry.category]} {t(`categories.${entry.category}`)}
              </span>
              {!entry.isPublished && <Badge color="gray">{t('draft')}</Badge>}
            </div>
            <h1 className="text-2xl font-serif text-amber-200">{entry.title}</h1>
            {entry.summary && <p className="text-slate-400 mt-1 text-sm">{entry.summary}</p>}
            {entry.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {canEdit && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  if (confirm(t('confirm_delete'))) deleteMutation.mutate();
                }}
                className="text-xs px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 rounded-md transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          )}
        </div>

        <hr className="border-slate-800 mb-6" />

        {entry.content ? (
          <MarkdownRenderer content={entry.content} />
        ) : (
          <p className="text-slate-500 italic">{t('no_content')}</p>
        )}
      </div>
    </div>
  );
}

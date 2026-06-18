import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loreApi } from '../../api/lore.api';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { usePermissions } from '../../hooks/usePermissions';
import type { LoreCategory } from '../../types/lore.types';

const LORE_CATEGORIES: LoreCategory[] = [
  'HISTORY', 'SYMBOLS', 'ENEMIES', 'FACTIONS', 'PLACES', 'CHARACTERS', 'CHRONICLES', 'OTHER',
];

const CATEGORY_ICONS: Record<LoreCategory, string> = {
  HISTORY: '📜', SYMBOLS: '🐐', ENEMIES: '⚔️', FACTIONS: '🏰',
  PLACES: '🗺️', CHARACTERS: '👤', CHRONICLES: '📖', OTHER: '📌',
};

export function LoreListPage() {
  const { t } = useTranslation('lore');
  const { can } = usePermissions();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<LoreCategory | ''>('');
  const canCreate = can('lore.create');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['lore', search, category],
    queryFn: () => loreApi.getAll({ search: search || undefined, category: category || undefined }),
    staleTime: 30_000,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('title')}</h1>
        {canCreate && (
          <Link to="/app/lore/create" className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-3 py-1.5 rounded-md transition-colors border border-amber-500">
            + {t('create_entry')}
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          placeholder={t('search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as LoreCategory | '')}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">{t('all_categories')}</option>
          {LORE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_ICONS[c]} {t(`categories.${c}`)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner className="py-20" />
      ) : entries.length === 0 ? (
        <EmptyState title={t('no_entries')} icon={<span className="text-5xl">📚</span>} />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              to={`/app/lore/${entry.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-amber-800 rounded-lg p-4 transition-colors group flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-amber-600 font-medium">
                    {CATEGORY_ICONS[entry.category]} {t(`categories.${entry.category}`)}
                  </span>
                  {!entry.isPublished && <Badge color="gray">{t('draft')}</Badge>}
                {entry.isRestricted && <Badge color="red">{t('restricted')}</Badge>}
                </div>
                <h3 className="font-medium text-slate-200 group-hover:text-amber-300 transition-colors">{entry.title}</h3>
                {entry.summary && <p className="text-xs text-slate-500 mt-1 truncate">{entry.summary}</p>}
                {entry.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

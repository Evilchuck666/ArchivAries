import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsApi } from '../../api/news.api';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { usePermissions } from '../../hooks/usePermissions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function NewsListPage() {
  const { t } = useTranslation('news');
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const canCreate = can('news.create');

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news', page],
    queryFn: () => newsApi.getAll(page, 15),
    staleTime: 30_000,
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('title')}</h1>
        {canCreate && (
          <Link to="/app/news/create" className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-3 py-1.5 rounded-md transition-colors border border-amber-500">
            + {t('create_news')}
          </Link>
        )}
      </div>

      {isLoading ? (
        <Spinner className="py-20" />
      ) : news.length === 0 ? (
        <EmptyState title={t('no_news')} icon={<span className="text-5xl">📢</span>} />
      ) : (
        <div className="flex flex-col gap-3">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/app/news/${item.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-amber-800 rounded-lg p-4 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.isImportant && <Badge color="red">⚠ {t('important')}</Badge>}
                    {!item.isPublished && <Badge color="gray">{t('draft')}</Badge>}
                  </div>
                  <h3 className="font-medium text-slate-200 group-hover:text-amber-300 transition-colors">{item.title}</h3>
                  {item.creator?.member && (
                    <p className="text-xs text-slate-500 mt-1">{item.creator.member.displayName}</p>
                  )}
                </div>
                <p className="text-xs text-slate-500 shrink-0">
                  {format(new Date(item.publishedAt), 'd MMM yyyy', { locale: es })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {news.length === 15 && (
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-300 rounded-md transition-colors"
          >
            ← {t('prev')}
          </button>
          <span className="text-sm text-slate-500 self-center">{t('page')} {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors"
          >
            {t('next')} →
          </button>
        </div>
      )}
    </div>
  );
}

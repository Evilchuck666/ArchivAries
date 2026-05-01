import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../api/documents.api';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/auth.store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ROLE_HIERARCHY = ['VISITOR', 'MEMBER', 'CONTENT_MANAGER', 'BOARD', 'ADMIN', 'SUPER_ADMIN'];

export function DocumentListPage() {
  const { t } = useTranslation('documents');
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const canCreate = user && ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf('CONTENT_MANAGER');

  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: documentsApi.getCategories,
    staleTime: 300_000,
  });

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents', search, categoryId],
    queryFn: () => documentsApi.getAll({ search: search || undefined, categoryId: categoryId || undefined }),
    staleTime: 30_000,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-amber-200">{t('title')}</h1>
        {canCreate && (
          <Link to="/app/documents/create" className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-3 py-1.5 rounded-md transition-colors border border-amber-500">
            + {t('create_document')}
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <Input placeholder={t('search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">{t('all_categories')}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <Spinner className="py-20" />
      ) : docs.length === 0 ? (
        <EmptyState title={t('no_documents')} icon={<span className="text-5xl">📜</span>} />
      ) : (
        <div className="flex flex-col gap-2">
          {docs.map((doc) => (
            <Link key={doc.id} to={`/app/documents/${doc.id}`} className="bg-slate-900 border border-slate-800 hover:border-amber-800 rounded-lg p-4 transition-colors group flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-amber-600 font-medium">{doc.category.name}</span>
                  {doc.isPinned && <span className="text-xs text-amber-500">📌</span>}
                  {doc.visibility === 'RESTRICTED' && <Badge color="red">{t('visibility_restricted')}</Badge>}
                </div>
                <h3 className="font-medium text-slate-200 group-hover:text-amber-300 transition-colors">{doc.title}</h3>
                {doc.summary && <p className="text-xs text-slate-500 mt-1 truncate">{doc.summary}</p>}
              </div>
              <p className="text-xs text-slate-500 shrink-0">{format(new Date(doc.updatedAt), 'd MMM', { locale: es })}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

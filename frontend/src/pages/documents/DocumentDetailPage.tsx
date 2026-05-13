import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../api/documents.api';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { usePermissions } from '../../hooks/usePermissions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('documents');
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canEdit = can('documents.edit');

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getOne(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => documentsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate('/app/documents');
    },
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!doc) return <p className="text-slate-400">{t('not_found')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
        <Link to="/app/documents" className="hover:text-amber-400 transition-colors">
          {t('title')}
        </Link>
        <span>/</span>
        <span className="text-amber-600">{doc.category.name}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs text-amber-600 font-medium">{doc.category.name}</span>
              {doc.isPinned && <span className="text-xs text-amber-500">📌 {t('pinned')}</span>}
              {doc.visibility === 'RESTRICTED' && <Badge color="red">{t('visibility_restricted')}</Badge>}
              {!doc.isPublished && <Badge color="gray">{t('draft')}</Badge>}
            </div>
            <h1 className="text-2xl font-serif text-amber-200">{doc.title}</h1>
            {doc.summary && <p className="text-slate-400 mt-1 text-sm">{doc.summary}</p>}
          </div>

          {canEdit && (
            <div className="flex gap-2 shrink-0">
              <Link
                to={`/app/documents/${id}/edit`}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors"
              >
                {t('edit')}
              </Link>
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

        <div className="text-xs text-slate-600 mb-6 flex gap-4">
          <span>{t('updated')}: {format(new Date(doc.updatedAt), "d 'de' MMMM yyyy", { locale: es })}</span>
          {doc.creator?.member && <span>{t('by')}: {doc.creator.member.displayName}</span>}
        </div>

        <hr className="border-slate-800 mb-6" />

        {doc.content ? (
          <MarkdownRenderer content={doc.content} />
        ) : (
          <p className="text-slate-500 italic">{t('no_content')}</p>
        )}
      </div>
    </div>
  );
}

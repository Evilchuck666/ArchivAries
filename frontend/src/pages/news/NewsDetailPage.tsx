import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsApi } from '../../api/news.api';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { useAuthStore } from '../../store/auth.store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ROLE_HIERARCHY = ['VISITOR', 'MEMBER', 'AREA_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('news');
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canEdit = user && ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf('AREA_MANAGER');

  const { data: item, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getOne(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => newsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      navigate('/app/news');
    },
  });

  if (isLoading) return <Spinner className="py-20" />;
  if (!item) return <p className="text-slate-400">{t('not_found')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
        <Link to="/app/news" className="hover:text-amber-400 transition-colors">{t('title')}</Link>
        <span>/</span>
        <span className="text-slate-400 truncate">{item.title}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {item.isImportant && <Badge color="red">⚠ {t('important')}</Badge>}
              {!item.isPublished && <Badge color="gray">{t('draft')}</Badge>}
            </div>
            <h1 className="text-2xl font-serif text-amber-200">{item.title}</h1>
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

        <div className="text-xs text-slate-600 mb-6 flex gap-4">
          <span>{format(new Date(item.publishedAt), "d 'de' MMMM yyyy", { locale: es })}</span>
          {item.creator?.member && <span>{item.creator.member.displayName}</span>}
        </div>

        <hr className="border-slate-800 mb-6" />

        {item.content ? (
          <MarkdownRenderer content={item.content} />
        ) : (
          <p className="text-slate-500 italic">{t('no_content')}</p>
        )}
      </div>
    </div>
  );
}

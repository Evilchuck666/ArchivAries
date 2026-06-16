import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../api/documents.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

export function DocumentEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('documents');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getOne(id!),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: documentsApi.getCategories,
    staleTime: 300_000,
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState<'ALL_MEMBERS' | 'RESTRICTED'>('ALL_MEMBERS');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setContent(doc.content ?? '');
      setSummary(doc.summary ?? '');
      setCategoryId(doc.category.id);
      setVisibility(doc.visibility);
      setIsPinned(doc.isPinned);
      setIsPublished(doc.isPublished);
      setInitialized(true);
    }
  }, [doc]);

  const mutation = useMutation({
    mutationFn: () =>
      documentsApi.update(id!, {
        title,
        content,
        summary: summary || undefined,
        categoryId,
        visibility,
        isPinned,
        isPublished,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate(`/app/documents/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId) return;
    mutation.mutate();
  };

  if (isLoading || !initialized) return <Spinner className="py-20" />;
  if (!doc) return <p className="text-slate-400">{t('not_found')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('edit_document')}</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.title')} *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.category')} *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">{t('form.select_category')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.summary')}</label>
          <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.content')}</label>
          <MarkdownEditor
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
          />
        </div>

        <div className="flex gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.visibility')}</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'ALL_MEMBERS' | 'RESTRICTED')}
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL_MEMBERS">{t('visibility.all_members')}</option>
              <option value="RESTRICTED">{t('visibility.restricted')}</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">{t('visibility.restricted_note')}</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm text-slate-400">{t('form.pin')}</span>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-amber-600"
          />
          {t('form.mark_published')}
        </label>

        {mutation.isError && (
          <p className="text-red-400 text-sm">{t('form.error')}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>{tc('actions.save_changes')}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(`/app/documents/${id}`)}>{tc('actions.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}

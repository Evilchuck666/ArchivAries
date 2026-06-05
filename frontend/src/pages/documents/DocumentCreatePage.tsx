import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../api/documents.api';
import { Input } from '../../components/ui/Input';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

export function DocumentCreatePage() {
  const { t } = useTranslation('documents');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState<'ALL_MEMBERS' | 'RESTRICTED'>('ALL_MEMBERS');
  const [isPinned, setIsPinned] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: documentsApi.getCategories,
    staleTime: 300_000,
  });

  const mutation = useMutation({
    mutationFn: (isPublished: boolean) => documentsApi.create({ title, content, summary: summary || undefined, categoryId, visibility, isPinned, isPublished }),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate(`/app/documents/${doc.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId) return;
    mutation.mutate(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_document')}</h1>

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
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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

        {mutation.isError && (
          <p className="text-red-400 text-sm">{t('form.error')}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending || !title || !categoryId}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors border border-amber-500"
          >
            {mutation.isPending ? t('form.saving') : t('form.save')}
          </button>
          <button
            type="button"
            disabled={mutation.isPending || !title || !categoryId}
            onClick={() => { if (!title || !categoryId) return; mutation.mutate(false); }}
            className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors disabled:opacity-50"
          >
            {t('form.save_draft')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/documents')}
            className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors"
          >
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

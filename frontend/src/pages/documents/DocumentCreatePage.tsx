import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../api/documents.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

export function DocumentCreatePage() {
  const { t } = useTranslation('documents');
  const { t: tc } = useTranslation('common');
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

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (isPublished: boolean) =>
      documentsApi.create({ title, content, summary: summary || undefined, categoryId, visibility, isPinned, isPublished }),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate(`/app/documents/${doc.id}`);
    },
  });

  const canSubmit = !!title && !!categoryId;

  const onPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutate(true);
  };
  const onDraft = () => {
    if (!canSubmit) return;
    mutate(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_document')}</h1>
      <Card>
        <form onSubmit={onPublish} className="flex flex-col gap-4">
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
            <MarkdownEditor value={content} onChange={(e) => setContent(e.target.value)} rows={16} />
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

          {isError && <p className="text-red-400 text-sm">{t('form.error')}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending} disabled={!canSubmit || isPending}>{t('form.save')}</Button>
            <Button type="button" variant="secondary" disabled={!canSubmit || isPending} onClick={onDraft}>{t('form.save_draft')}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/app/documents')}>{tc('actions.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

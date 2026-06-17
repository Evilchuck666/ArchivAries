import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsApi } from '../../api/news.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

export function NewsCreatePage() {
  const { t } = useTranslation('news');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (isPublished: boolean) =>
      newsApi.create({ title, content, isImportant, isPublished }),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      navigate(`/app/news/${item.id}`);
    },
  });

  const canSubmit = !!title;

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
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_news')}</h1>
      <Card>
        <form onSubmit={onPublish} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.title')} *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.content')}</label>
            <MarkdownEditor value={content} onChange={(e) => setContent(e.target.value)} rows={14} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm text-slate-400">⚠ {t('form.mark_important')}</span>
          </label>

          {isError && <p className="text-red-400 text-sm">{t('form.error')}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending} disabled={!canSubmit || isPending}>{t('form.publish')}</Button>
            <Button type="button" variant="secondary" disabled={!canSubmit || isPending} onClick={onDraft}>{t('form.save_draft')}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/app/news')}>{tc('actions.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsApi } from '../../api/news.api';
import { Input } from '../../components/ui/Input';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

export function NewsCreatePage() {
  const { t } = useTranslation('news');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const mutation = useMutation({
    mutationFn: () => newsApi.create({ title, content, isImportant }),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      navigate(`/app/news/${item.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    mutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_news')}</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.title')} *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.content')}</label>
          <MarkdownEditor
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
          />
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

        {mutation.isError && <p className="text-red-400 text-sm">{t('form.error')}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending || !title}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors border border-amber-500"
          >
            {mutation.isPending ? t('form.saving') : t('form.publish')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/news')}
            className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors"
          >
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

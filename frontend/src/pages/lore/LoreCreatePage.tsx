import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loreApi } from '../../api/lore.api';
import { Input } from '../../components/ui/Input';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';
import type { LoreCategory } from '../../types/lore.types';

const LORE_CATEGORIES: LoreCategory[] = [
  'HISTORY', 'SYMBOLS', 'ENEMIES', 'FACTIONS', 'PLACES', 'CHARACTERS', 'CHRONICLES', 'OTHER',
];

export function LoreCreatePage() {
  const { t } = useTranslation('lore');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<LoreCategory>('OTHER');
  const [tagsInput, setTagsInput] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      return loreApi.create({ title, content, summary: summary || undefined, category, tags });
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['lore'] });
      navigate(`/app/lore/${entry.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    mutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_entry')}</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.title')} *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.category')}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LoreCategory)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {LORE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`categories.${c}`)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.summary')}</label>
          <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.tags')} <span className="text-slate-600">{t('form.tags_help')}</span></label>
          <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={t('form.tags_placeholder')} />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">{t('form.content')}</label>
          <MarkdownEditor
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
          />
        </div>

        {mutation.isError && <p className="text-red-400 text-sm">{t('form.error')}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending || !title}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors border border-amber-500"
          >
            {mutation.isPending ? t('form.saving') : t('form.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/lore')}
            className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors"
          >
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loreApi } from '../../api/lore.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';
import type { LoreCategory } from '../../types/lore.types';

const LORE_CATEGORIES: LoreCategory[] = [
  'HISTORY', 'SYMBOLS', 'ENEMIES', 'FACTIONS', 'PLACES', 'CHARACTERS', 'CHRONICLES', 'OTHER',
];

export function LoreCreatePage() {
  const { t } = useTranslation('lore');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<LoreCategory>('OTHER');
  const [tagsInput, setTagsInput] = useState('');

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (isPublished: boolean) => {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      return loreApi.create({ title, content, summary: summary || undefined, category, tags, isPublished });
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['lore'] });
      navigate(`/app/lore/${entry.id}`);
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
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_entry')}</h1>
      <Card>
        <form onSubmit={onPublish} className="flex flex-col gap-4">
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
            <label className="block text-sm text-slate-400 mb-1">
              {t('form.tags')} <span className="text-slate-600">{t('form.tags_help')}</span>
            </label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={t('form.tags_placeholder')} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.content')}</label>
            <MarkdownEditor value={content} onChange={(e) => setContent(e.target.value)} rows={16} />
          </div>

          {isError && <p className="text-red-400 text-sm">{t('form.error')}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending} disabled={!canSubmit || isPending}>{t('form.save')}</Button>
            <Button type="button" variant="secondary" disabled={!canSubmit || isPending} onClick={onDraft}>{t('form.save_draft')}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/app/lore')}>{tc('actions.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

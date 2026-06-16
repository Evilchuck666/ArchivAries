import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { loreApi } from '../../api/lore.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';
import type { LoreCategory } from '../../types/lore.types';

const LORE_CATEGORIES: LoreCategory[] = [
  'HISTORY', 'SYMBOLS', 'ENEMIES', 'FACTIONS', 'PLACES', 'CHARACTERS', 'CHRONICLES', 'OTHER',
];

export function LoreEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('lore');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<LoreCategory>('OTHER');
  const [tagsInput, setTagsInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ['lore', id],
    queryFn: () => loreApi.getOne(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content ?? '');
      setSummary(entry.summary ?? '');
      setCategory(entry.category);
      setTagsInput(entry.tags.join(', '));
      setIsPublished(entry.isPublished);
      setInitialized(true);
    }
  }, [entry]);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      return loreApi.update(id!, { title, content, summary: summary || undefined, category, tags, isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lore', id] });
      queryClient.invalidateQueries({ queryKey: ['lore'] });
      navigate(`/app/lore/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    mutate();
  };

  if (isLoading || !initialized) return <Spinner className="py-20" />;
  if (!entry) return <p className="text-slate-500">{t('not_found')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('edit_entry')}</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <MarkdownEditor
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
            />
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

          {isError && <p className="text-red-400 text-sm">{t('form.save_error')}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending}>{tc('actions.save_changes')}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>{tc('actions.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

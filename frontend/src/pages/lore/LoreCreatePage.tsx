import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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

interface FormData {
  title: string;
  content: string;
  summary: string;
  category: LoreCategory;
  tagsInput: string;
}

export function LoreCreatePage() {
  const { t } = useTranslation('lore');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { category: 'OTHER', summary: '', tagsInput: '' },
  });
  const watchTitle = watch('title');
  const canSubmit = !!watchTitle;

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: FormData & { isPublished: boolean }) => {
      const { tagsInput, ...rest } = data;
      const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
      return loreApi.create({ ...rest, summary: rest.summary || undefined, tags });
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['lore'] });
      navigate(`/app/lore/${entry.id}`);
    },
  });

  const onPublish = handleSubmit((d) => mutate({ ...d, isPublished: true }));
  const onDraft   = handleSubmit((d) => mutate({ ...d, isPublished: false }));

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_entry')}</h1>
      <Card>
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.title')} *</label>
            <Input {...register('title', { required: true })} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.category')}</label>
            <select
              {...register('category')}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {LORE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`categories.${c}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.summary')}</label>
            <Input {...register('summary')} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              {t('form.tags')} <span className="text-slate-600">{t('form.tags_help')}</span>
            </label>
            <Input {...register('tagsInput')} placeholder={t('form.tags_placeholder')} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.content')}</label>
            <MarkdownEditor {...register('content')} rows={16} />
          </div>

          {isError && <p className="text-red-400 text-sm">{t('form.error')}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" loading={isPending} disabled={!canSubmit || isPending} onClick={onPublish}>
              {t('form.save')}
            </Button>
            <Button type="button" variant="secondary" disabled={!canSubmit || isPending} onClick={onDraft}>
              {t('form.save_draft')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/app/lore')}>
              {tc('actions.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

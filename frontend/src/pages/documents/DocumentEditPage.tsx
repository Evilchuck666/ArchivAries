import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../api/documents.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

interface FormData {
  title: string;
  content: string;
  summary: string;
  categoryId: string;
  visibility: 'ALL_MEMBERS' | 'RESTRICTED';
  isPinned: boolean;
  isPublished: boolean;
}

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

  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const [initialized, setInitialized] = useState(false);
  const [wTitle, wCat] = watch(['title', 'categoryId']);
  const canSubmit = !!wTitle && !!wCat;

  useEffect(() => {
    if (doc) {
      reset({
        title: doc.title,
        content: doc.content ?? '',
        summary: doc.summary ?? '',
        categoryId: doc.category.id,
        visibility: doc.visibility,
        isPinned: doc.isPinned,
        isPublished: doc.isPublished,
      });
      setInitialized(true);
    }
  }, [doc, reset]);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: FormData) =>
      documentsApi.update(id!, { ...data, summary: data.summary || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate(`/app/documents/${id}`);
    },
  });

  if (isLoading || !initialized) return <Spinner className="py-20" />;
  if (!doc) return <p className="text-slate-400">{t('not_found')}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('edit_document')}</h1>
      <Card>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.title')} *</label>
            <Input {...register('title', { required: true })} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.category')} *</label>
            <select
              {...register('categoryId', { required: true })}
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
            <Input {...register('summary')} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('form.content')}</label>
            <MarkdownEditor {...register('content')} rows={16} />
          </div>

          <div className="flex gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('form.visibility')}</label>
              <select
                {...register('visibility')}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL_MEMBERS">{t('visibility.all_members')}</option>
                <option value="RESTRICTED">{t('visibility.restricted')}</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">{t('visibility.restricted_note')}</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input type="checkbox" {...register('isPinned')} className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-slate-400">{t('form.pin')}</span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" {...register('isPublished')} className="rounded border-slate-600 bg-slate-800 text-amber-600" />
            {t('form.mark_published')}
          </label>

          {isError && <p className="text-red-400 text-sm">{t('form.save_error')}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending} disabled={isPending || !canSubmit}>{tc('actions.save_changes')}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate(`/app/documents/${id}`)}>{tc('actions.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

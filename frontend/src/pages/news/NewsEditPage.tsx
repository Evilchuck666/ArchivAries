import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { newsApi } from '../../api/news.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

interface FormData {
  title: string;
  content: string;
  isImportant: boolean;
  isPublished: boolean;
}

export function NewsEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('news');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getOne(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const [initialized, setInitialized] = useState(false);
  const watchTitle = watch('title');
  const canSubmit = !!watchTitle;

  useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        content: item.content ?? '',
        isImportant: item.isImportant,
        isPublished: item.isPublished,
      });
      setInitialized(true);
    }
  }, [item, reset]);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: FormData) => newsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news', id] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      navigate(`/app/news/${id}`);
    },
  });

  if (isLoading || !initialized) return <Spinner className="py-20" />;
  if (!item) return <p className="text-slate-500">{t('not_found')}</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('edit_news')}</h1>
      <Card>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
          <Input label={t('form.title')} {...register('title', { required: true })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">{t('form.content')}</label>
            <MarkdownEditor {...register('content')} rows={6} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" {...register('isImportant')} className="rounded border-slate-600 bg-slate-800 text-amber-600" />
            {t('form.mark_important')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" {...register('isPublished')} className="rounded border-slate-600 bg-slate-800 text-amber-600" />
            {t('form.mark_published')}
          </label>
          {isError && <p className="text-red-400 text-sm">{t('form.save_error')}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending} disabled={isPending || !canSubmit}>{tc('actions.save_changes')}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>{tc('actions.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

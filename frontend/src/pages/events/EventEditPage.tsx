import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../api/events.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { DateTimeInput } from '../../components/ui/DateTimeInput';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

interface FormData {
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  practicalInfo: string;
  isPublic: boolean;
  isPublished: boolean;
}

export function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('events');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getOne(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, control } = useForm<FormData>();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate ?? '',
        location: event.location ?? '',
        description: event.description ?? '',
        practicalInfo: event.practicalInfo ?? '',
        isPublic: event.isPublic,
        isPublished: event.isPublished,
      });
      setInitialized(true);
    }
  }, [event, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => eventsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/app/events/${id}`);
    },
  });

  if (isLoading || !initialized) return <Spinner className="py-20" />;
  if (!event) return <p className="text-slate-500">{t('not_found')}</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('edit_event')}</h1>
      <Card>
        <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
          <Input label={t('event_name')} {...register('title', { required: true })} />
          <Input label={t('event_type')} {...register('eventType', { required: true })} placeholder={t('event_type_placeholder')} />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="startDate"
              rules={{ required: true }}
              render={({ field }) => (
                <DateTimeInput label={t('start_date')} value={field.value} onChange={field.onChange} required />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DateTimeInput label={t('end_date')} value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <Input label={t('location')} {...register('location')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">{t('description_markdown')}</label>
            <MarkdownEditor {...register('description')} rows={5} placeholder={t('description_placeholder')} />
            <p className="text-xs text-slate-500">{t('description_note')}</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">{t('practical_info')}</label>
            <MarkdownEditor {...register('practicalInfo')} rows={3} placeholder={t('practical_info_placeholder')} />
            <p className="text-xs text-slate-500">{t('practical_info_note')}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" {...register('isPublic')} className="rounded border-slate-600 bg-slate-800 text-amber-600" />
            {t('is_public')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" {...register('isPublished')} className="rounded border-slate-600 bg-slate-800 text-amber-600" />
            {t('form.mark_published')}
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending}>{tc('actions.save_changes')}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>{tc('actions.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

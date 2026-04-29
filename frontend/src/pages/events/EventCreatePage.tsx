import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../api/events.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DateTimeInput } from '../../components/ui/DateTimeInput';

interface FormData {
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  practicalInfo: string;
  isPublic: boolean;
}

export function EventCreatePage() {
  const { t } = useTranslation('events');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control } = useForm<FormData>();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => eventsApi.create(data),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/app/events/${event.id}`);
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_event')}</h1>
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
            <textarea {...register('description')} rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">{t('practical_info')}</label>
            <textarea {...register('practicalInfo')} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" {...register('isPublic')} className="rounded border-slate-600 bg-slate-800 text-amber-600" />
            {t('is_public')}
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>{tc('actions.cancel')}</Button>
            <Button type="submit" loading={isPending}>{t('create_event')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

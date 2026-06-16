import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { eventsApi } from '../../api/events.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
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
  isPublished?: boolean;
}

export function EventCreatePage() {
  const { t } = useTranslation('events');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, watch } = useForm<FormData>();
  const [watchTitle, watchEventType, watchStartDate] = watch(['title', 'eventType', 'startDate']);
  const canSubmit = !!watchTitle && !!watchEventType && !!watchStartDate;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => eventsApi.create(data),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/app/events/${event.id}`);
    },
  });

  const onPublish = handleSubmit((d) => mutate({ ...d, isPublished: true }));
  const onDraft   = handleSubmit((d) => mutate({ ...d, isPublished: false }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_event')}</h1>
      <Card>
        <form className="flex flex-col gap-4">
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
          <div className="flex gap-3 pt-2">
            <Button type="button" loading={isPending} disabled={!canSubmit || isPending} onClick={onPublish}>
              {t('create_event')}
            </Button>
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={() => { if (!canSubmit) return; onDraft(); }}
              className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors disabled:opacity-50"
            >
              {t('form.save_draft')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/events')}
              className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors"
            >
              {tc('actions.cancel')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

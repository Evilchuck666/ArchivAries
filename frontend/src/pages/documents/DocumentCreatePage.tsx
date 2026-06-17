import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '../../api/documents.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkdownEditor } from '../../components/ui/MarkdownEditor';

interface FormData {
  title: string;
  content: string;
  summary: string;
  categoryId: string;
  visibility: 'ALL_MEMBERS' | 'RESTRICTED';
  isPinned: boolean;
}

export function DocumentCreatePage() {
  const { t } = useTranslation('documents');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: documentsApi.getCategories,
    staleTime: 300_000,
  });

  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { visibility: 'ALL_MEMBERS', isPinned: false, summary: '' },
  });
  const [watchTitle, watchCategoryId] = watch(['title', 'categoryId']);
  const canSubmit = !!watchTitle && !!watchCategoryId;

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: FormData & { isPublished: boolean }) =>
      documentsApi.create({ ...data, summary: data.summary || undefined }),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate(`/app/documents/${doc.id}`);
    },
  });

  const onPublish = handleSubmit((d) => mutate({ ...d, isPublished: true }));
  const onDraft   = handleSubmit((d) => mutate({ ...d, isPublished: false }));

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-amber-200 mb-6">{t('create_document')}</h1>
      <Card>
        <form className="flex flex-col gap-4">
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
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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

          {isError && <p className="text-red-400 text-sm">{t('form.error')}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" loading={isPending} disabled={!canSubmit || isPending} onClick={onPublish}>
              {t('form.save')}
            </Button>
            <Button type="button" variant="secondary" disabled={!canSubmit || isPending} onClick={onDraft}>
              {t('form.save_draft')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/app/documents')}>
              {tc('actions.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

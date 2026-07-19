import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  error?: string | null;
  title?: string;
  confirmLabel?: string;
}

export function ConfirmActionModal({ isOpen, message, onConfirm, onCancel, isPending, error, title, confirmLabel }: Props) {
  const { t } = useTranslation('common');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-serif text-red-400 mb-2">
          {title ?? t('actions.delete')}
        </h2>
        <p className="text-slate-300 text-sm mb-1">{message}</p>
        <p className="text-slate-500 text-xs mb-4">{t('errors.delete_irreversible')}</p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="text-sm px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
          >
            {t('actions.cancel')}
          </button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            loading={isPending}
          >
            {confirmLabel ?? t('actions.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}

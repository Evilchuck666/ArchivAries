import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  email: string;
  currentIsActive: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function ConfirmStatusModal({ email, currentIsActive, onConfirm, onCancel, isPending }: Props) {
  const { t: ta } = useTranslation('admin');
  const { t } = useTranslation('common');
  const [reason, setReason] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-serif text-amber-200 mb-2">
          {ta(currentIsActive ? 'deactivate_modal_title' : 'activate_modal_title')}
        </h2>
        <p className="text-slate-300 text-sm mb-4">
          {ta(currentIsActive ? 'deactivate_modal_body' : 'activate_modal_body', { email })}
        </p>
        <label className="block text-sm text-slate-400 mb-1">
          {ta('status_reason_label')}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={ta('status_reason_placeholder')}
          rows={3}
          autoFocus
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={!reason.trim() || isPending}
            className="text-sm px-4 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md transition-colors border border-amber-600"
          >
            {ta('status_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

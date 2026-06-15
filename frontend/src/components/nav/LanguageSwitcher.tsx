import { useTranslation } from 'react-i18next';
import { useUiStore } from '../../store/ui.store';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useUiStore();

  const toggle = () => {
    const next = language === 'es' ? 'ca' : 'es';
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="text-xs font-medium text-slate-400 hover:text-amber-300 transition-colors border border-slate-700 hover:border-amber-700 rounded px-2 py-1 uppercase tracking-wide cursor-pointer"
    >
      {language === 'es' ? 'CA' : 'ES'}
    </button>
  );
}

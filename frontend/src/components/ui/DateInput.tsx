import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import { parseISO, isValid, format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DateInput({ label, value, onChange, required }: Props) {
  // parseISO avoids timezone shift: new Date('YYYY-MM-DD') is UTC midnight, parseISO is local midnight
  const selected = value ? (() => { const d = parseISO(value); return isValid(d) ? d : null; })() : null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-300">{label}{required && ' *'}</label>
      <DatePicker
        locale={es}
        selected={selected}
        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
        dateFormat="dd/MM/yyyy"
        placeholderText="dd/mm/aaaa"
        required={required}
        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        wrapperClassName="w-full"
      />
    </div>
  );
}

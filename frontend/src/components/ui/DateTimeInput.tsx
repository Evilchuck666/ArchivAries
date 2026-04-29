import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import { format, parse, isValid } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const ISO_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function DateTimeInput({ label, value, onChange, required }: Props) {
  const parsed = value ? parse(value, ISO_FORMAT, new Date()) : null;
  const selected = parsed && isValid(parsed) ? parsed : null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-300">{label}{required && ' *'}</label>
      <DatePicker
        locale={es}
        selected={selected}
        onChange={(date: Date | null) => onChange(date ? format(date, ISO_FORMAT) : '')}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="dd/MM/yyyy HH:mm"
        placeholderText="dd/mm/aaaa hh:mm"
        required={required}
        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        wrapperClassName="w-full"
      />
    </div>
  );
}

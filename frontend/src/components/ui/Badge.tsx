type Color = 'amber' | 'green' | 'blue' | 'red' | 'gray' | 'purple' | 'yellow';

interface Props {
  color?: Color;
  children: React.ReactNode;
  className?: string;
}

const colors: Record<Color, string> = {
  amber: 'bg-amber-900/40 text-amber-300 border-amber-800',
  green: 'bg-green-900/40 text-green-300 border-green-800',
  blue: 'bg-blue-900/40 text-blue-300 border-blue-800',
  red: 'bg-red-900/40 text-red-300 border-red-800',
  gray: 'bg-slate-800 text-slate-400 border-slate-700',
  purple: 'bg-purple-900/40 text-purple-300 border-purple-800',
  yellow: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
};

export function Badge({ color = 'gray', children, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

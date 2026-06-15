interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-lg ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          {title && <h3 className="font-semibold text-amber-100 text-sm">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

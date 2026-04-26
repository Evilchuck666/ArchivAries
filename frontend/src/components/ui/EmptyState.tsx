interface Props {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title = 'Sin contenido', description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon && <div className="text-slate-600 mb-2">{icon}</div>}
      <p className="text-slate-400 font-medium">{title}</p>
      {description && <p className="text-slate-500 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

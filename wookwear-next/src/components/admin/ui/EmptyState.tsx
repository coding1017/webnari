export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-xl bg-ww-surface flex items-center justify-center text-ww-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-head font-semibold text-ww-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-ww-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

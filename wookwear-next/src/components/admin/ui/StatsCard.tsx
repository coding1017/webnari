export function StatsCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-ww-dark border border-ww-border rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ww-muted">{label}</p>
          <p className="text-2xl font-head font-bold text-ww-white mt-1">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.positive ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend.positive ? "+" : ""}
              {trend.value}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-ww-surface flex items-center justify-center text-ww-purple">
          {icon}
        </div>
      </div>
    </div>
  );
}

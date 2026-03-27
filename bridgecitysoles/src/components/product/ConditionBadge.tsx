import { getConditionById } from '@/lib/data';

export function ConditionBadge({ conditionId, size = 'sm' }: { conditionId: string; size?: 'sm' | 'md' }) {
  const condition = getConditionById(conditionId);
  if (!condition) return null;

  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider ${sizeClasses}`}
      style={{ backgroundColor: condition.color + '22', color: condition.color }}
    >
      {condition.name}
    </span>
  );
}

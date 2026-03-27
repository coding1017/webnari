'use client';

import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/types/product';

interface SizeSelectorProps {
  inventory: InventoryItem[];
  allSizes: string[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  selectedCondition?: string | null;
}

export function SizeSelector({ inventory, allSizes, selectedSize, onSelectSize, selectedCondition }: SizeSelectorProps) {
  const availableSizes = new Set(
    inventory
      .filter(i => i.isActive && i.quantity > 0 && (!selectedCondition || i.conditionId === selectedCondition))
      .map(i => i.size)
  );

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
      {allSizes.map(size => {
        const available = availableSizes.has(size);
        const selected = selectedSize === size;

        return (
          <button
            key={size}
            onClick={() => available && onSelectSize(size)}
            disabled={!available}
            className={cn(
              'py-2.5 px-1 rounded-lg text-sm font-medium transition-all border',
              selected
                ? 'bg-bcs-teal text-bcs-black border-bcs-teal'
                : available
                ? 'bg-bcs-surface border-bcs-border text-bcs-white hover:border-bcs-teal/50'
                : 'bg-bcs-surface/50 border-bcs-border/50 text-bcs-muted/40 cursor-not-allowed line-through'
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

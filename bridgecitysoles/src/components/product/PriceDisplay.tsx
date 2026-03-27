import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  retailPrice?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ price, retailPrice, size = 'md' }: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const saved = retailPrice && price < retailPrice ? retailPrice - price : null;
  const markup = retailPrice && price > retailPrice ? price - retailPrice : null;

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold text-bcs-white ${sizeClasses[size]}`}>
        {formatPrice(price)}
      </span>
      {retailPrice && retailPrice !== price && (
        <span className="text-sm text-bcs-muted line-through">
          {formatPrice(retailPrice)}
        </span>
      )}
      {saved && saved > 0 && (
        <span className="text-xs text-bcs-green font-medium">
          Save {formatPrice(saved)}
        </span>
      )}
      {markup && markup > 0 && (
        <span className="text-xs text-bcs-muted">
          +{formatPrice(markup)} over retail
        </span>
      )}
    </div>
  );
}

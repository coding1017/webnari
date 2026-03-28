export function SkeletonBox({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonText({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3.5"
          style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-ww-surface border border-ww-border rounded-[20px] overflow-hidden">
      <div className="aspect-square skeleton rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/3" />
        <SkeletonBox className="h-3 w-1/4" />
        <SkeletonBox className="h-10 w-full rounded-[12px]" />
      </div>
    </div>
  );
}

export function SkeletonProductDetail() {
  return (
    <div className="min-h-screen pt-[100px] pb-24">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        <SkeletonBox className="h-4 w-40 mb-8" />
        <div className="grid grid-cols-2 gap-16 max-lg:grid-cols-1 max-lg:gap-10">
          <div className="aspect-square skeleton rounded-[20px]" />
          <div className="space-y-4 pt-4">
            <SkeletonBox className="h-10 w-3/4" />
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonBox className="h-8 w-1/4" />
            <SkeletonText lines={3} />
            <SkeletonBox className="h-14 w-full rounded-[12px] mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlogCard() {
  return (
    <div className="bg-ww-surface border border-ww-border rounded-[16px] overflow-hidden">
      <div className="aspect-[16/9] skeleton rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-5 w-4/5" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

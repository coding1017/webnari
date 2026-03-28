import { SkeletonCard } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        <div className="skeleton h-4 w-48 mb-5" />
        <div className="skeleton h-12 w-72 mb-10" />

        <div className="flex gap-3 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-24 rounded-[12px]" />
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 max-md:gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

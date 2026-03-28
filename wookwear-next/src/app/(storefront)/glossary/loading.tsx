import { SkeletonBox } from "@/components/ui/Skeleton";

export default function GlossaryLoading() {
  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        <div className="skeleton h-4 w-40 mb-5" />
        <div className="skeleton h-12 w-56 mb-10" />
        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonBox key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

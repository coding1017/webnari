import { SkeletonBlogCard } from "@/components/ui/Skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        <div className="skeleton h-4 w-32 mb-5" />
        <div className="skeleton h-12 w-64 mb-10" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlogCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

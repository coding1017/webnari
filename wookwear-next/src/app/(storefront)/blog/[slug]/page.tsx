import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPostBySlug, CATEGORY_LABELS } from "@/data/blog";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found | Wook Wear" };

  return {
    title: `${post.title} | Wook Wear Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[800px] mx-auto px-10 max-md:px-5">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="flex items-center gap-2 text-sm text-ww-muted mb-8 font-head tracking-wider uppercase">
            <Link href="/blog" className="hover:text-ww-pink transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-ww-text truncate">{post.title}</span>
          </nav>
        </ScrollReveal>

        {/* Post Header */}
        <ScrollReveal>
          <div className="mb-10">
            <span className="inline-block px-3 py-1 text-[10px] font-head font-bold tracking-[0.15em] uppercase rounded-full bg-[rgba(168,85,247,0.15)] text-ww-purple2 mb-4">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
            <h1 className="font-head font-black text-[clamp(32px,5vw,52px)] leading-[1.05] text-ww-white mb-5">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-ww-muted font-head tracking-wider uppercase">
              <span>{formattedDate}</span>
              <span className="w-1 h-1 rounded-full bg-ww-border" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Featured Image */}
        <ScrollReveal>
          <div className="aspect-[16/9] rounded-[20px] overflow-hidden border border-ww-border mb-12">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </ScrollReveal>

        {/* Blog Content */}
        <ScrollReveal>
          <div
            className="blog-content text-ww-text text-base leading-[1.8] [&>h2]:font-head [&>h2]:font-black [&>h2]:text-2xl [&>h2]:text-ww-white [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:leading-[1.2] [&>p]:mb-5 [&>p:last-child]:mb-0 [&>ul]:mb-5 [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:list-disc [&>ol]:mb-5 [&>ol]:pl-6 [&>ol>li]:mb-2 [&>ol>li]:list-decimal [&>a]:text-ww-pink [&>a]:underline [&>a:hover]:text-ww-pink2 [&>blockquote]:border-l-4 [&>blockquote]:border-ww-purple [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-ww-muted [&>blockquote]:my-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </ScrollReveal>

        {/* Tags */}
        {post.tags.length > 0 && (
          <ScrollReveal>
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-ww-border">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[11px] font-head font-bold tracking-[0.1em] uppercase rounded-full border border-ww-border text-ww-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Back Link */}
        <ScrollReveal>
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-head text-sm font-bold tracking-[0.1em] uppercase text-ww-pink hover:text-ww-pink2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

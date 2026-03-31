import Link from 'next/link';
import { blogPosts, getPostBySlug } from '@/data/blog';
import { notFound } from 'next/navigation';

const categoryLabels: Record<string, string> = {
  guides: 'Guides',
  culture: 'Culture',
  releases: 'Releases',
  care: 'Care',
  history: 'History',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: post ? `${post.title} | Bridge City Soles Blog` : 'Blog Post',
    description: post?.excerpt || 'Read the latest from Bridge City Soles.',
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-bcs-muted mb-8">
        <Link href="/blog" className="hover:text-bcs-rust transition-colors">
          Blog
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <Link
          href={`/blog?category=${post.category}`}
          className="hover:text-bcs-rust transition-colors capitalize"
        >
          {categoryLabels[post.category] || post.category}
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-bcs-text truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Category Badge + Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-bcs-rust text-bcs-black px-2.5 py-1 rounded-full">
          {categoryLabels[post.category] || post.category}
        </span>
        <span className="text-sm text-bcs-muted">{formatDate(post.date)}</span>
        <span className="w-1 h-1 rounded-full bg-bcs-border" />
        <span className="text-sm text-bcs-muted">{post.readTime}</span>
      </div>

      {/* Title */}
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
        {post.title}
      </h1>

      {/* Featured Image */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10 bg-bcs-surface2">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <div
        className="blog-content space-y-5 mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-10 pt-6 border-t border-bcs-border">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-3 py-1.5 rounded-full bg-bcs-surface2 text-bcs-text border-[3px] border-bcs-gold/50"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-bcs-rust hover:text-bcs-rust2 uppercase tracking-wide transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { blogPosts, BLOG_CATEGORIES } from '@/data/blog';

const categoryLabels: Record<string, string> = {
  all: 'All',
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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered =
    activeCategory === 'all'
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3">
          The BCS <span className="text-bcs-rust">Blog</span>
        </h1>
        <p className="text-bcs-text text-lg max-w-xl mx-auto">
          Sneaker news, guides, and stories from Portland&apos;s trusted source.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide transition-all duration-300 border ${
              activeCategory === cat
                ? 'bg-bcs-rust text-bcs-black border-bcs-rust shadow-[0_0_12px_rgba(184,137,42,0.3)]'
                : 'bg-bcs-surface text-bcs-text border-bcs-border hover:border-bcs-rust/40 hover:text-bcs-white'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((post, i) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <article
              className="bg-bcs-surface rounded-xl overflow-hidden border-[3px] border-bcs-gold/50 hover:border-bcs-gold/60 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(184,137,42,0.15)] warm-glow"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden bg-bcs-surface2">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Category Badge */}
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-bcs-rust text-bcs-black px-2.5 py-1 rounded-full">
                  {categoryLabels[post.category]}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-lg sm:text-xl font-bold uppercase leading-tight mb-2 text-bcs-white group-hover:text-bcs-rust transition-colors duration-300">
                  {post.title}
                </h2>
                <p className="text-sm text-bcs-text leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-bcs-muted">
                  <div className="flex items-center gap-3">
                    <span>{formatDate(post.date)}</span>
                    <span className="w-1 h-1 rounded-full bg-bcs-border" />
                    <span>{post.readTime}</span>
                  </div>
                  <span className="text-bcs-rust font-semibold uppercase tracking-wide group-hover:underline">
                    Read More
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-bcs-muted text-lg">No posts in this category yet.</p>
        </div>
      )}
    </div>
  );
}

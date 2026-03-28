"use client";

import { useState } from "react";
import Link from "next/link";
import { posts, BLOG_CATEGORIES, CATEGORY_LABELS } from "@/data/blog";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen pt-[120px] pb-24 max-md:pt-[100px] max-md:pb-16">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-5">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <div className="flex items-center gap-3 font-head text-[11px] font-bold tracking-[0.2em] uppercase text-ww-pink mb-5 justify-center">
            <span className="w-8 h-0.5 bg-[image:var(--gradient)] flex-shrink-0" />
            The Blog
          </div>
          <h1 className="font-head font-black text-[clamp(42px,6vw,72px)] leading-[0.95] text-ww-white mb-6">
            Craft <span className="gradient-text">Stories</span>
          </h1>
          <p className="text-lg text-ww-text max-w-[560px] mx-auto leading-relaxed">
            Techniques, materials, culture, and behind-the-scenes looks at the
            handmade process.
          </p>
        </ScrollReveal>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-12 justify-center">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 font-head text-xs font-bold tracking-[0.1em] uppercase rounded-[12px] border transition-all",
                activeCategory === cat
                  ? "bg-[rgba(168,85,247,0.15)] border-ww-purple text-ww-white"
                  : "bg-transparent border-ww-border text-ww-text hover:border-ww-purple hover:text-ww-white"
              )}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
          {filtered.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i % 2 === 0 ? 0 : 1}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block bg-ww-surface rounded-[20px] border border-ww-border overflow-hidden transition-all hover:border-ww-purple hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-[10px] font-head font-bold tracking-[0.15em] uppercase rounded-full bg-[rgba(168,85,247,0.15)] text-ww-purple2 mb-3">
                    {CATEGORY_LABELS[post.category] || post.category}
                  </span>
                  <h2 className="font-head font-black text-xl leading-[1.2] text-ww-white mb-3 group-hover:text-ww-pink transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-ww-text leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-ww-muted font-head tracking-wider uppercase">
                    <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="w-1 h-1 rounded-full bg-ww-border" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-ww-muted text-lg mt-16">
            No posts in this category yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { createPost, updatePost } from "@/app/admin/_actions/content";

interface PostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  read_time: string;
  image_url: string;
  published: boolean;
}

export function BlogForm({ post, mode }: { post?: PostData; mode: "create" | "edit" }) {
  const action = mode === "create" ? createPost : updatePost;
  const [state, formAction, isPending] = useActionState(action, { error: "" });

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {mode === "edit" && <input type="hidden" name="id" value={post?.id} />}

      <div className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4">
        <h2 className="font-head font-semibold text-ww-white">Post Details</h2>

        <div>
          <label className="block text-sm font-medium text-ww-text mb-1.5">Title</label>
          <input name="title" type="text" required defaultValue={post?.title}
            className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm"
            placeholder="Post title..." />
        </div>

        {mode === "create" && (
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">Slug</label>
            <input name="slug" type="text" required
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm"
              placeholder="post-url-slug" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ww-text mb-1.5">Excerpt</label>
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt}
            className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm resize-none"
            placeholder="Short summary..." />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">Category</label>
            <select name="category" defaultValue={post?.category || "techniques"}
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm">
              <option value="techniques">Techniques</option>
              <option value="materials">Materials</option>
              <option value="culture">Culture</option>
              <option value="behind-the-scenes">Behind the Scenes</option>
              <option value="guides">Guides</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">Read Time</label>
            <input name="read_time" type="text" defaultValue={post?.read_time || "5 min"}
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white focus:outline-none focus:border-ww-purple transition-colors text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1.5">Tags</label>
            <input name="tags" type="text" defaultValue={post?.tags?.join(", ")}
              className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm"
              placeholder="tag1, tag2, tag3" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ww-text mb-1.5">Image URL</label>
          <input name="image_url" type="text" defaultValue={post?.image_url}
            className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm"
            placeholder="https://..." />
        </div>

        <label className="flex items-center gap-2 text-sm text-ww-text cursor-pointer">
          <input type="checkbox" name="published" defaultChecked={post?.published ?? true}
            className="w-4 h-4 rounded border-ww-border bg-ww-surface text-ww-purple focus:ring-ww-purple" />
          Published
        </label>
      </div>

      {/* Content Editor */}
      <div className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4">
        <h2 className="font-head font-semibold text-ww-white">Content (HTML)</h2>
        <textarea name="content" rows={16} defaultValue={post?.content}
          className="w-full px-3 py-2.5 bg-ww-surface border border-ww-border rounded-lg text-ww-white placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-purple transition-colors text-sm font-mono resize-y"
          placeholder="<p>Write your post content here...</p>" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending}
          className="px-6 py-2.5 bg-ww-purple hover:bg-ww-purple/80 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm">
          {isPending ? "Saving..." : mode === "create" ? "Publish Post" : "Save Changes"}
        </button>
        <a href="/admin/blog" className="px-4 py-2.5 text-sm text-ww-muted hover:text-ww-white transition-colors">Cancel</a>
      </div>
    </form>
  );
}

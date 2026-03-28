import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { BlogPublishToggle } from "./BlogPublishToggle";

async function getPosts() {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false })) as { data: any[] | null };
  return data ?? [];
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ww-white">Blog</h1>
          <p className="text-sm text-ww-muted mt-0.5">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-ww-purple hover:bg-ww-purple/80 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>}
          title="No blog posts"
          description="Start writing content to engage your audience."
          action={<Link href="/admin/blog/new" className="px-4 py-2 bg-ww-purple hover:bg-ww-purple/80 text-white text-sm font-medium rounded-lg transition-colors">Write Post</Link>}
        />
      ) : (
        <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ww-border">
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Title</th>
                <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Category</th>
                <th className="text-center text-xs font-medium text-ww-muted uppercase px-4 py-3">Published</th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase px-4 py-3">Date</th>
                <th className="text-right text-xs font-medium text-ww-muted uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any) => (
                <tr key={post.id} className="border-b border-ww-border/50 last:border-0 hover:bg-ww-surface/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-ww-white">{post.title}</p>
                    <p className="text-xs text-ww-muted">{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.category} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <BlogPublishToggle postId={post.id} published={post.published} />
                  </td>
                  <td className="px-4 py-3 text-sm text-ww-muted text-right">
                    {new Date(post.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/blog/${post.slug}`} className="text-xs text-ww-purple hover:text-ww-purple/80 font-medium transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

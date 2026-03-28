import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogForm } from "@/components/admin/BlogForm";

async function getPost(slug: string) {
  const supabase = createAdminClient();
  const { data } = await (supabase.from("blog_posts") as any).select("*").eq("slug", slug).single();
  return data as any;
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ww-white">Edit Post</h1>
        <p className="text-sm text-ww-muted mt-0.5">{post.title}</p>
      </div>
      <BlogForm post={post as any} mode="edit" />
    </div>
  );
}

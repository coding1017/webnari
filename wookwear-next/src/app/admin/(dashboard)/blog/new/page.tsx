import { BlogForm } from "@/components/admin/BlogForm";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ww-white">New Post</h1>
        <p className="text-sm text-ww-muted mt-0.5">Write a new blog entry</p>
      </div>
      <BlogForm mode="create" />
    </div>
  );
}

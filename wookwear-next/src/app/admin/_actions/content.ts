"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function db() {
  return createAdminClient() as any;
}

// --- Blog ---

export async function createPost(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();
  const supabase = db();

  const slug = (formData.get("slug") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string) || "";
  const content = (formData.get("content") as string) || "";
  const category = formData.get("category") as string;
  const tags = (formData.get("tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) || [];
  const readTime = (formData.get("read_time") as string) || "5 min";
  const imageUrl = (formData.get("image_url") as string) || "";
  const published = formData.get("published") === "on";

  if (!slug || !title || !category) {
    return { error: "Slug, title, and category are required" };
  }

  const { error } = await supabase.from("blog_posts").insert({
    slug,
    title,
    excerpt,
    content,
    category,
    tags,
    read_time: readTime,
    image_url: imageUrl,
    published,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();
  const supabase = db();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string) || "";
  const content = (formData.get("content") as string) || "";
  const category = formData.get("category") as string;
  const tags = (formData.get("tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) || [];
  const readTime = (formData.get("read_time") as string) || "5 min";
  const imageUrl = (formData.get("image_url") as string) || "";
  const published = formData.get("published") === "on";

  const { error } = await supabase.from("blog_posts")
    .update({ title, excerpt, content, category, tags, read_time: readTime, image_url: imageUrl, published })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  await requireAdmin();
  const supabase = db();
  await supabase.from("blog_posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePostPublished(id: string, published: boolean) {
  await requireAdmin();
  const supabase = db();
  await supabase.from("blog_posts").update({ published }).eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

// --- Glossary ---

export async function createTerm(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();
  const supabase = db();

  const term = (formData.get("term") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const definition = (formData.get("definition") as string) || "";
  const category = formData.get("category") as string;

  if (!term || !slug || !definition || !category) {
    return { error: "All fields are required" };
  }

  const { error } = await supabase.from("glossary_terms")
    .insert({ term, slug, definition, category });

  if (error) return { error: error.message };

  revalidatePath("/admin/glossary");
  revalidatePath("/glossary");
  return { error: "" };
}

export async function deleteTerm(id: string) {
  await requireAdmin();
  const supabase = db();
  await supabase.from("glossary_terms").delete().eq("id", id);
  revalidatePath("/admin/glossary");
  revalidatePath("/glossary");
}

// --- Reviews ---

export async function approveReview(id: string) {
  await requireAdmin();
  const supabase = db();
  await supabase.from("reviews").update({ approved: true }).eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function rejectReview(id: string) {
  await requireAdmin();
  const supabase = db();
  await supabase.from("reviews").update({ approved: false }).eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const supabase = db();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
}

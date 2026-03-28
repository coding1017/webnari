"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitReview(
  _prevState: { status: string; message: string },
  formData: FormData
) {
  const productId = formData.get("product_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const text = (formData.get("text") as string)?.trim();
  const rating = parseInt(formData.get("rating") as string);

  if (!name || !text || !rating || rating < 1 || rating > 5) {
    return { status: "error", message: "Please fill in all fields and select a rating." };
  }

  const supabase = createAdminClient() as any;

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    name,
    text,
    rating,
    approved: false, // Requires admin approval
  });

  if (error) {
    return { status: "error", message: "Something went wrong. Try again." };
  }

  revalidatePath(`/product/${productId}`);
  return { status: "success", message: "Thanks! Your review is pending approval." };
}

import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewsManager } from "./ReviewsManager";

async function getReviews() {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("reviews")
    .select("*, products:product_id(name)")
    .order("created_at", { ascending: false })) as { data: any[] | null };
  return data ?? [];
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  return <ReviewsManager initialReviews={reviews} />;
}

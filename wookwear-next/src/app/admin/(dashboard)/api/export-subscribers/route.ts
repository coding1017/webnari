import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = (await supabase
    .from("newsletter_subscribers")
    .select("email, subscribed_at, unsubscribed_at")
    .order("subscribed_at", { ascending: false })) as { data: any[] | null };

  const rows = data ?? [];
  const csv = [
    "email,subscribed_at,unsubscribed_at",
    ...rows.map(
      (r) => `${r.email},${r.subscribed_at},${r.unsubscribed_at || ""}`
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

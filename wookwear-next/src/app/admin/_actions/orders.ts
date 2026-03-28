"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function db() { return createAdminClient() as any; }

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();

  await db().from("orders").update({ status }).eq("id", orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function addOrderNote(orderId: string, note: string) {
  await requireAdmin();

  await db().from("orders").update({ notes: note }).eq("id", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
}

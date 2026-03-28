"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function subscribe(
  _prevState: { status: string; message: string },
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { status: "error" as const, message: "Please enter a valid email address." };
  }

  const supabase = createAdminClient() as any;

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { status: "duplicate" as const, message: "You're already on the list!" };
    }
    return { status: "error" as const, message: "Something went wrong. Try again." };
  }

  return { status: "success" as const, message: "You're in! Watch your inbox for drops." };
}

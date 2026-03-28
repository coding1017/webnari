import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `uploads/${filename}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}

export async function DELETE(request: NextRequest) {
  await requireAdmin();

  const { path } = await request.json();

  if (!path) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Extract storage path from full URL
  const storagePath = path.includes("/product-images/")
    ? path.split("/product-images/").pop()
    : path;

  const { error } = await supabase.storage
    .from("product-images")
    .remove([storagePath]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

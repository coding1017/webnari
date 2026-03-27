import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service role client — only use in server-side code (API routes, scripts)
// This bypasses RLS policies
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

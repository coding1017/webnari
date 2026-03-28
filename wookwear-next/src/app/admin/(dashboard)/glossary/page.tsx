import { createAdminClient } from "@/lib/supabase/admin";
import { GlossaryManager } from "./GlossaryManager";

async function getTerms() {
  const supabase = createAdminClient();
  const { data } = (await supabase.from("glossary_terms").select("*").order("term")) as { data: any[] | null };
  return data ?? [];
}

export default async function AdminGlossaryPage() {
  const terms = await getTerms();
  return <GlossaryManager initialTerms={terms} />;
}

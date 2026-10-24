import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/** Cookie-less anon client for public pages. Keeps them statically cacheable; RLS limits it to public rows. */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

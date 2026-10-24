import { createPublicClient } from "@/lib/supabase/public";
import type { EventCategory, GccEvent } from "@/lib/content";

/** Published events from the database, mapped to the shape the site components use. */
export async function fetchPublicEvents(): Promise<GccEvent[]> {
  const { data } = await createPublicClient().from("events").select("*").eq("published", true).order("starts_on");
  return (data ?? []).map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    category: e.category as EventCategory,
    date: e.starts_on,
    time: e.time_label,
    venue: e.venue || "Venue to be confirmed",
    address: e.address,
    summary: e.summary,
    registerUrl: e.register_url ?? undefined,
  }));
}

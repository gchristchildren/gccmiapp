import { createPublicClient } from "@/lib/supabase/public";
import type { EventCategory, GccEvent } from "@/lib/content";

/** Published events from the database, mapped to the shape the site components use. */
export async function fetchPublicEvents(): Promise<GccEvent[]> {
  const db = createPublicClient();
  const [{ data }, { data: media }] = await Promise.all([
    db.from("events").select("*").eq("published", true).order("starts_on"),
    db.from("event_media").select("event_id"),
  ]);
  const counts = new Map<string, number>();
  for (const m of media ?? []) counts.set(m.event_id, (counts.get(m.event_id) ?? 0) + 1);
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
    mediaCount: counts.get(e.id) ?? 0,
  }));
}

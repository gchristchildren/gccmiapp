import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { loadParents } from "@/lib/audience";

const DAY = 86_400_000;
const TZ = "Europe/London";
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Everything on the admin analytics page. Admin sessions only. */
export async function loadAnalytics(db: SupabaseClient<Database>) {
  const now = Date.now();
  const parents = await loadParents(db);
  const { data: ev } = await db
    .from("login_events")
    .select("profile_id, created_at")
    .gte("created_at", new Date(now - 90 * DAY).toISOString())
    .order("created_at")
    .limit(50_000);
  const events = ev ?? [];

  const within = (iso: string | null, d: number) => !!iso && now - new Date(iso).getTime() <= d * DAY;
  const children = parents.flatMap((p) => p.children);

  // Parents
  const countryMap = new Map<string, number>();
  for (const p of parents) countryMap.set(p.country || "Not given", (countryMap.get(p.country || "Not given") ?? 0) + 1);
  const countriesSorted = [...countryMap.entries()].sort((a, b) => b[1] - a[1]);

  const months: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    months.push({ label: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }), value: parents.filter((p) => p.joined.slice(0, 7) === key).length });
  }

  const ageCounts = ["Kids", "Pre-Teens", "Teens"].map((g) => ({ group: g, value: children.filter((c) => c.ageGroup === g).length }));
  const perFamily = [
    { label: "None", value: parents.filter((p) => p.children.length === 0).length },
    { label: "1", value: parents.filter((p) => p.children.length === 1).length },
    { label: "2", value: parents.filter((p) => p.children.length === 2).length },
    { label: "3+", value: parents.filter((p) => p.children.length >= 3).length },
  ];

  // Sign-ins (only since tracking began)
  const first = events[0]?.created_at ?? null;
  const parts = (iso: string) => {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", hour: "2-digit", hour12: false }).formatToParts(new Date(iso));
    const get = (t: string) => f.find((x) => x.type === t)?.value ?? "";
    return { dow: days.indexOf(get("weekday")), hour: Number(get("hour")) % 24 };
  };
  const byHour = Array.from({ length: 24 }, (_, h) => ({ label: h % 3 === 0 ? String(h) : "", value: 0 }));
  const byDay = days.map((label) => ({ label, value: 0 }));
  for (const e of events) {
    const { dow, hour } = parts(e.created_at);
    if (dow >= 0) byDay[dow].value++;
    byHour[hour].value++;
  }
  const weeks: { label: string; value: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = now - (i + 1) * 7 * DAY;
    const end = now - i * 7 * DAY;
    weeks.push({
      label: new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: TZ }),
      value: events.filter((e) => new Date(e.created_at).getTime() > start && new Date(e.created_at).getTime() <= end).length,
    });
  }
  const last30 = events.filter((e) => within(e.created_at, 30));
  const activeUsers30 = new Set(last30.map((e) => e.profile_id)).size;

  return {
    totals: {
      parents: parents.length,
      children: children.length,
      new30: parents.filter((p) => within(p.joined, 30)).length,
      active7: parents.filter((p) => within(p.lastSignIn, 7)).length,
      active30: parents.filter((p) => within(p.lastSignIn, 30)).length,
      neverSignedIn: parents.filter((p) => !p.lastSignIn).length,
      pushOn: parents.filter((p) => p.pushOn).length,
      news: parents.filter((p) => p.news).length,
      withKids: parents.filter((p) => p.children.length > 0).length,
    },
    countriesSorted,
    months,
    ageCounts,
    perFamily,
    tracking: { since: first, total: events.length, last30: last30.length, perActiveParentPerWeek: activeUsers30 ? Math.round(((last30.length / activeUsers30) / (30 / 7)) * 10) / 10 : 0 },
    byHour,
    byDay,
    weeks,
  };
}

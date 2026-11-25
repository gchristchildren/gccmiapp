import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { ageGroups } from "@/lib/format";

/** One parent with everything the admin directory and the audience filters need. */
export type ParentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string; // "" when not given
  joined: string;
  lastSignIn: string | null;
  pushOn: boolean;
  masterclass: boolean;
  news: boolean; // agreed to news emails
  children: { name: string; ageGroup: string }[];
};

export const NO_COUNTRY = "__none";
export const kidBands = ["none", "1", "2", "3+"] as const;
export type Tri = "any" | "yes" | "no";

export type AudienceFilter = {
  q: string;
  countries: string[];
  kids: string[]; // subset of kidBands; empty = any
  ages: string[]; // parent has a child in any of these groups; empty = any
  masterclass: Tri;
  push: Tri;
  news: Tri;
  from: string; // yyyy-mm-dd
  to: string;
};

type Params = Record<string, string | string[] | undefined>;
const list = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const tri = (v: string | string[] | undefined): Tri => (one(v) === "yes" ? "yes" : one(v) === "no" ? "no" : "any");
const day = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

/** Reads the filter from page or download URL parameters. Anything unexpected is ignored. */
export function parseAudience(params: Params): AudienceFilter {
  return {
    q: one(params.q).trim().slice(0, 100),
    countries: list(params.country).slice(0, 300),
    kids: list(params.kids).filter((k) => (kidBands as readonly string[]).includes(k)),
    ages: list(params.age).filter((a) => (ageGroups as readonly string[]).includes(a)),
    masterclass: tri(params.mc),
    push: tri(params.push),
    news: tri(params.news),
    from: day(one(params.from)),
    to: day(one(params.to)),
  };
}

/** Reads a filter from a saved query string such as "country=Spain&age=Teens". */
export function parseQuery(qs: string): AudienceFilter {
  const u = new URLSearchParams(qs);
  return parseAudience(Object.fromEntries([...new Set(u.keys())].map((k) => [k, u.getAll(k)])));
}

/** The same filter as URL parameters, for links and download buttons. */
export function audienceQuery(f: AudienceFilter): string {
  const u = new URLSearchParams();
  if (f.q) u.set("q", f.q);
  f.countries.forEach((c) => u.append("country", c));
  f.kids.forEach((k) => u.append("kids", k));
  f.ages.forEach((a) => u.append("age", a));
  if (f.masterclass !== "any") u.set("mc", f.masterclass);
  if (f.push !== "any") u.set("push", f.push);
  if (f.news !== "any") u.set("news", f.news);
  if (f.from) u.set("from", f.from);
  if (f.to) u.set("to", f.to);
  return u.toString();
}

export const isFiltered = (f: AudienceFilter) => audienceQuery(f) !== "";

const band = (n: number) => (n === 0 ? "none" : n === 1 ? "1" : n === 2 ? "2" : "3+");
const yes = (t: Tri, v: boolean) => t === "any" || (t === "yes") === v;

export function applyAudience(rows: ParentRow[], f: AudienceFilter): ParentRow[] {
  const q = f.q.toLowerCase();
  return rows.filter((r) => {
    if (q && !`${r.name} ${r.email}`.toLowerCase().includes(q)) return false;
    if (f.countries.length && !f.countries.includes(r.country || NO_COUNTRY)) return false;
    if (f.kids.length && !f.kids.includes(band(r.children.length))) return false;
    if (f.ages.length && !r.children.some((c) => f.ages.includes(c.ageGroup))) return false;
    if (!yes(f.masterclass, r.masterclass) || !yes(f.push, r.pushOn) || !yes(f.news, r.news)) return false;
    const d = r.joined.slice(0, 10);
    if (f.from && d < f.from) return false;
    if (f.to && d > f.to) return false;
    return true;
  });
}

/** Loads every parent with children, sign-in, notification and membership details. Admin sessions only. */
export async function loadParents(supabase: SupabaseClient<Database>): Promise<ParentRow[]> {
  const [{ data: profiles }, { data: kids }, { data: stats }, { data: members }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "parent").order("created_at", { ascending: false }).limit(5000),
    supabase.from("children").select("parent_id, first_name, last_name, age_group").order("first_name").limit(20000),
    supabase.rpc("admin_parent_stats"),
    supabase.from("masterclass_memberships").select("profile_id").eq("status", "active"),
  ]);
  const stat = new Map((stats ?? []).map((s) => [s.profile_id, s]));
  const member = new Set((members ?? []).map((m) => m.profile_id));
  const byParent = new Map<string, ParentRow["children"]>();
  for (const k of kids ?? []) {
    const arr = byParent.get(k.parent_id) ?? [];
    arr.push({ name: `${k.first_name} ${k.last_name}`.trim(), ageGroup: k.age_group });
    byParent.set(k.parent_id, arr);
  }
  return (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.full_name,
    email: p.email ?? "",
    phone: p.phone ?? "",
    country: p.country ?? "",
    joined: p.created_at,
    lastSignIn: stat.get(p.id)?.last_sign_in_at ?? null,
    pushOn: stat.get(p.id)?.push_on ?? false,
    masterclass: member.has(p.id),
    news: p.email_updates,
    children: byParent.get(p.id) ?? [],
  }));
}

// ---------------------------------------------------------------- rules on events and announcements
/** Who an event or announcement is for. Empty lists mean "anyone". Matches the database function private.matches_audience. */
export type AudienceRule = { countries: string[]; kids: string[]; ages: string[] };

const strings = (v: unknown, allowed?: readonly string[]) =>
  (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 100 && (!allowed || allowed.includes(x))).slice(0, 300);

/** Reads the rule from the form fields (rule_country, rule_kids, rule_age). Returns null when nothing is chosen (everyone). */
export function ruleFromForm(f: FormData): AudienceRule | null {
  const rule: AudienceRule = {
    countries: strings(f.getAll("rule_country").map(String)),
    kids: strings(f.getAll("rule_kids").map(String), kidBands),
    ages: strings(f.getAll("rule_age").map(String), ageGroups),
  };
  return rule.countries.length || rule.kids.length || rule.ages.length ? rule : null;
}

/** Reads a rule stored in the database. */
export function parseRule(json: unknown): AudienceRule | null {
  if (!json || typeof json !== "object") return null;
  const j = json as Record<string, unknown>;
  const rule: AudienceRule = { countries: strings(j.countries), kids: strings(j.kids, kidBands), ages: strings(j.ages, ageGroups) };
  return rule.countries.length || rule.kids.length || rule.ages.length ? rule : null;
}

export function ruleToFilter(rule: AudienceRule): AudienceFilter {
  return { q: "", countries: rule.countries, kids: rule.kids, ages: rule.ages, masterclass: "any", push: "any", news: "any", from: "", to: "" };
}

const bandWords: Record<string, string> = { none: "no children", "1": "1 child", "2": "2 children", "3+": "3 or more children" };

/** Plain-English summary, e.g. "Parents in Spain · with 2 children · with a child in Teens". */
export function describeRule(rule: AudienceRule | null): string {
  if (!rule) return "Everyone";
  const parts: string[] = [];
  if (rule.countries.length) parts.push(`in ${rule.countries.map((c) => (c === NO_COUNTRY ? "no country given" : c)).join(" or ")}`);
  if (rule.kids.length) parts.push(`with ${rule.kids.map((k) => bandWords[k]).join(" or ")}`);
  if (rule.ages.length) parts.push(`with a child in ${rule.ages.join(" or ")}`);
  return `Parents ${parts.join(", ")}`;
}

import { BookOpen, FileWarning, Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const metadata = { title: "Parent portal" };
export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const { supabase, user, profile } = await requireUser();
  const now = new Date().toISOString();

  const [{ data: children }, { data: upcoming }, { data: past }, { data: notes }, { data: forms }, { data: sigs }] =
    await Promise.all([
      supabase.from("children").select("*").order("created_at"),
      supabase.from("sessions").select("*").gte("starts_at", now).order("starts_at").limit(20),
      supabase.from("sessions").select("*").lt("starts_at", now).not("memory_verse", "is", null).order("starts_at", { ascending: false }).limit(1),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
      supabase.from("consent_forms").select("id").eq("required", true),
      supabase.from("consent_signatures").select("form_id, child_id").eq("signed_by", user.id),
    ]);

  const kids = children ?? [];
  const groups = new Set(kids.map((c) => c.age_group));
  const next = (upcoming ?? []).filter((s) => s.age_group === "all" || groups.has(s.age_group)).slice(0, 3);
  const signed = new Set((sigs ?? []).map((s) => `${s.form_id}:${s.child_id}`));
  const missing = kids.flatMap((c) => (forms ?? []).filter((f) => !signed.has(`${f.id}:${c.id}`)));
  const verse = past?.[0];
  const first = (profile?.full_name ?? "").split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome{first ? `, ${first}` : ""}</h1>
        <p className="text-sm text-muted">
          {kids.length ? `You have ${kids.length} ${kids.length === 1 ? "child" : "children"} registered.` : "Register your first child to get started."}
        </p>
      </div>

      {!kids.length && (
        <Card className="bg-brand-soft">
          <h2 className="font-bold">Register your child for Bible Club</h2>
          <p className="mt-1 text-sm text-muted">Add your child, choose their age group and see the weekly schedule.</p>
          <Link href="/portal/children" className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg">
            <Plus className="size-4" /> Add a child
          </Link>
        </Card>
      )}

      {missing.length > 0 && (
        <Link href="/portal/forms" className="flex items-center gap-3 rounded-3xl border border-amber-500/40 bg-gold-soft p-4 text-sm">
          <FileWarning className="size-5 text-gold" />
          <span><strong>{missing.length}</strong> consent {missing.length === 1 ? "form needs" : "forms need"} your attention.</span>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold">Next sessions</h2>
          <ul className="mt-4 space-y-3">
            {next.map((s) => (
              <li key={s.id} className="rounded-2xl bg-surface-2 p-3 text-sm">
                <p className="font-semibold">{s.title}</p>
                <p className="text-muted">{fmtDateTime(s.starts_at)}{s.venue ? ` · ${s.venue}` : ""}</p>
                <p className="mt-1 text-xs text-brand">Ages {s.age_group === "all" ? "all" : s.age_group}</p>
              </li>
            ))}
            {!next.length && <li className="text-sm text-muted">No upcoming sessions for your children&apos;s age groups yet.</li>}
          </ul>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-bold"><BookOpen className="size-4 text-brand" /> Latest memory verse</h2>
          {verse ? (
            <div className="mt-4 text-sm">
              <p className="rounded-2xl bg-brand-soft p-4 text-base font-medium">{verse.memory_verse}</p>
              <p className="mt-2 text-muted">{verse.title} · {fmtDate(verse.starts_at)}</p>
              {verse.lesson_summary && <p className="mt-3">{verse.lesson_summary}</p>}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Memory verses and lesson summaries will appear here after each session.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Latest announcements</h2>
          <Link href="/portal/announcements" className="text-sm font-medium text-brand">See all</Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {(notes ?? []).map((n) => (
            <li key={n.id} className="py-3 text-sm">
              <p className="font-semibold">{n.title}</p>
              <p className="text-muted">{n.body}</p>
            </li>
          ))}
          {!notes?.length && <li className="py-3 text-sm text-muted">No announcements yet.</li>}
        </ul>
      </Card>
    </div>
  );
}

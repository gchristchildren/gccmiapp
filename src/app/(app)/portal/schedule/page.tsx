import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const metadata = { title: "Schedule & lessons" };
export const dynamic = "force-dynamic";

export default async function Schedule() {
  const { supabase } = await requireUser();
  const [{ data: kids }, { data: sessions }, { data: att }] = await Promise.all([
    supabase.from("children").select("id, first_name, age_group"),
    supabase.from("sessions").select("*").order("starts_at"),
    supabase.from("attendance").select("session_id, child_id, present"),
  ]);
  const groups = new Set((kids ?? []).map((k) => k.age_group));
  const mine = (sessions ?? []).filter((s) => s.age_group === "all" || groups.has(s.age_group));
  const now = Date.now();
  const upcoming = mine.filter((s) => new Date(s.starts_at).getTime() >= now);
  const past = mine.filter((s) => new Date(s.starts_at).getTime() < now).reverse();
  const name = new Map((kids ?? []).map((k) => [k.id, k.first_name]));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Schedule & lessons</h1>
      <section>
        <h2 className="mb-3 font-bold">Upcoming</h2>
        <div className="space-y-3">
          {upcoming.map((s) => (
            <Card key={s.id} className="p-5 text-sm">
              <p className="text-base font-bold">{s.title}</p>
              <p className="text-muted">{fmtDateTime(s.starts_at)}{s.venue ? ` · ${s.venue}` : ""} · Ages {s.age_group}</p>
            </Card>
          ))}
          {!upcoming.length && <p className="text-sm text-muted">No upcoming sessions yet.</p>}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-bold">Past lessons</h2>
        <div className="space-y-3">
          {past.map((s) => (
            <Card key={s.id} className="p-5 text-sm">
              <p className="text-base font-bold">{s.title}</p>
              <p className="text-muted">{fmtDate(s.starts_at)}</p>
              {s.memory_verse && <p className="mt-2 rounded-2xl bg-brand-soft p-3 font-medium">{s.memory_verse}</p>}
              {s.lesson_summary && <p className="mt-2">{s.lesson_summary}</p>}
              <p className="mt-2 text-xs text-muted">
                {(att ?? []).filter((a) => a.session_id === s.id).map((a) => `${name.get(a.child_id)}: ${a.present ? "present" : "absent"}`).join(" · ")}
              </p>
            </Card>
          ))}
          {!past.length && <p className="text-sm text-muted">Lesson summaries will appear here.</p>}
        </div>
      </section>
    </div>
  );
}

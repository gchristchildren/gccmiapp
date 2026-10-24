import Link from "next/link";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createSession } from "@/lib/actions/admin";
import { ageGroups, ageLabel, fmtDateTime } from "@/lib/format";

export const metadata = { title: "Bible Club sessions" };
export const dynamic = "force-dynamic";

export default async function Sessions({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("sessions").select("*").order("starts_at", { ascending: false });
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Bible Club sessions</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Card>
        <h2 className="font-bold">Add a session</h2>
        <form action={createSession} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required className={input} placeholder="Bible Club: The Good Samaritan" /></label>
          <label className="text-sm font-medium">Starts (UK time)<input name="starts_at" type="datetime-local" required className={input} /></label>
          <label className="text-sm font-medium">Age group
            <select name="age_group" className={input} defaultValue="all">
              <option value="all">All ages</option>
              {ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium sm:col-span-2">Venue<input name="venue" className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Memory verse (optional)<input name="memory_verse" className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Lesson summary (optional)<textarea name="lesson_summary" rows={2} className={input} /></label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Add session</button>
        </form>
      </Card>
      <div className="space-y-3">
        {(data ?? []).map((s) => (
          <Link key={s.id} href={`/admin/sessions/${s.id}`} className="block rounded-3xl border border-line bg-surface p-5 text-sm shadow-card transition hover:-translate-y-0.5">
            <p className="text-base font-bold">{s.title}</p>
            <p className="text-muted">{fmtDateTime(s.starts_at)} · {ageLabel(s.age_group)}{s.venue ? ` · ${s.venue}` : ""}</p>
            <p className="mt-1 text-xs font-medium text-brand">Open to mark attendance and add lesson notes →</p>
          </Link>
        ))}
        {!data?.length && <p className="text-sm text-muted">No sessions yet.</p>}
      </div>
    </div>
  );
}

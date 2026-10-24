import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteSession, saveAttendance, updateSession, updateSessionContent } from "@/lib/actions/admin";
import { ageGroups, fmtDateTime, isoToUkLocal } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SessionDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; updated?: string; error?: string }> }) {
  const { id } = await params;
  const { saved, updated, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: s } = await supabase.from("sessions").select("*").eq("id", id).single();
  if (!s) notFound();

  const kidsQuery = supabase.from("children").select("id, first_name, last_name, age_group, medical_notes").order("first_name");
  const [{ data: kids }, { data: att }] = await Promise.all([
    s.age_group === "all" ? kidsQuery : kidsQuery.eq("age_group", s.age_group),
    supabase.from("attendance").select("child_id, present").eq("session_id", id),
  ]);
  const marked = new Map((att ?? []).map((a) => [a.child_id, a.present]));
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="text-sm text-muted">{fmtDateTime(s.starts_at)} · ages {s.age_group}</p>
      </div>
      {saved && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Attendance saved.</p>}
      {updated && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Session updated.</p>}
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Card>
        <h2 className="font-bold">Attendance</h2>
        <form action={saveAttendance} className="mt-4">
          <input type="hidden" name="session_id" value={s.id} />
          <ul className="divide-y divide-line text-sm">
            {(kids ?? []).map((k) => (
              <li key={k.id} className="flex items-center justify-between py-2.5">
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <input type="hidden" name="child" value={k.id} />
                  <input type="checkbox" name="present" value={k.id} defaultChecked={marked.get(k.id) ?? false} className="size-5 accent-[var(--brand)]" />
                  <span>{k.first_name} {k.last_name} <span className="text-muted">· {k.age_group}</span></span>
                </label>
                {k.medical_notes && <span className="text-xs text-gold">Medical note</span>}
              </li>
            ))}
            {!kids?.length && <li className="py-2 text-muted">No registered children in this age group yet.</li>}
          </ul>
          {!!kids?.length && <button className="mt-4 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90">Save attendance</button>}
        </form>
      </Card>

      <Card>
        <details>
          <summary className="cursor-pointer font-bold">Edit session details</summary>
          <form action={updateSession} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={s.id} />
            <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required defaultValue={s.title} className={input} /></label>
            <label className="text-sm font-medium">Starts (UK time)<input name="starts_at" type="datetime-local" required defaultValue={isoToUkLocal(s.starts_at)} className={input} /></label>
            <label className="text-sm font-medium">Age group
              <select name="age_group" defaultValue={s.age_group} className={input}>
                <option value="all">All ages</option>
                {ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium sm:col-span-2">Venue<input name="venue" defaultValue={s.venue} className={input} /></label>
            <label className="text-sm font-medium sm:col-span-2">Memory verse<input name="memory_verse" defaultValue={s.memory_verse ?? ""} className={input} /></label>
            <label className="text-sm font-medium sm:col-span-2">Lesson summary<textarea name="lesson_summary" rows={3} defaultValue={s.lesson_summary ?? ""} className={input} /></label>
            <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="published" defaultChecked={s.published} className="size-4 accent-[var(--brand)]" /> Visible to parents</label>
            <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Save changes</button>
          </form>
        </details>
        <form action={deleteSession} className="mt-5 border-t border-line pt-4">
          <input type="hidden" name="id" value={s.id} />
          <ConfirmButton message="Delete this session? Its attendance records will be deleted too. This cannot be undone." className="rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">
            Delete session
          </ConfirmButton>
        </form>
      </Card>

      <Card>
        <h2 className="font-bold">Lesson notes for parents</h2>
        <form action={updateSessionContent} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={s.id} />
          <label className="block text-sm font-medium">Memory verse<input name="memory_verse" defaultValue={s.memory_verse ?? ""} className={input} /></label>
          <label className="block text-sm font-medium">Lesson summary<textarea name="lesson_summary" rows={3} defaultValue={s.lesson_summary ?? ""} className={input} /></label>
          <button className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold hover:bg-brand-soft">Save notes</button>
        </form>
      </Card>
    </div>
  );
}

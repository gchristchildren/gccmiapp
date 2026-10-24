import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { volunteerSkills } from "@/lib/content";
import { fmtDate } from "@/lib/format";
import { createOpportunity, deleteOpportunity, setOpportunityPublished } from "@/lib/actions/volunteering";

export const metadata = { title: "Volunteer opportunities" };
export const dynamic = "force-dynamic";

export default async function AdminOpportunities({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: opps }, { data: signups }, { data: profiles }, { data: applicants }, { data: events }] = await Promise.all([
    supabase.from("volunteer_opportunities").select("*").order("created_at", { ascending: false }),
    supabase.from("opportunity_signups").select("*"),
    supabase.from("profiles").select("id, full_name, skills"),
    supabase.from("volunteers").select("id, full_name, email, skills, status").neq("status", "inactive"),
    supabase.from("events").select("id, title, starts_on").order("starts_on", { ascending: false }).limit(50),
  ]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  const overlap = (a: string[], b: string[]) => a.filter((s) => b.includes(s)).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Volunteer opportunities</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Card>
        <h2 className="font-bold">Add an opportunity</h2>
        <form action={createOpportunity} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">Role title<input name="title" required className={input} placeholder="Registration desk at the Academy" /></label>
          <label className="text-sm font-medium sm:col-span-2">Description<textarea name="description" rows={2} className={input} /></label>
          <label className="text-sm font-medium">Date (optional)<input name="starts_on" type="date" className={input} /></label>
          <label className="text-sm font-medium">Linked event (optional)
            <select name="event_id" className={input} defaultValue=""><option value="">None</option>{(events ?? []).map((e) => <option key={e.id} value={e.id}>{e.title} · {fmtDate(e.starts_on)}</option>)}</select>
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium">Skills needed</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {volunteerSkills.map((s) => (
                <label key={s} className="cursor-pointer"><input type="checkbox" name="skills" value={s} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-line px-4 py-1.5 text-sm peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-fg">{s}</span></label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="send_push" defaultChecked className="size-4 accent-[var(--brand)]" /> Notify people whose skills match (push)</label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Add opportunity</button>
        </form>
      </Card>

      {(opps ?? []).map((o) => {
        const joined = (signups ?? []).filter((s) => s.opportunity_id === o.id);
        const names = joined.map((s) => (profiles ?? []).find((p) => p.id === s.profile_id)?.full_name || "(no name)");
        const joinedIds = new Set(joined.map((s) => s.profile_id));
        const suggestedMembers = (profiles ?? []).filter((p) => !joinedIds.has(p.id) && overlap(p.skills, o.skills) > 0);
        const suggestedApplicants = (applicants ?? []).filter((a) => overlap(a.skills, o.skills) > 0).sort((a, b) => overlap(b.skills, o.skills) - overlap(a.skills, o.skills));
        return (
          <Card key={o.id} className="p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold">{o.title} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${o.published ? "bg-brand-soft text-brand" : "bg-gold-soft text-gold"}`}>{o.published ? "Open" : "Closed"}</span></p>
                <p className="text-xs text-muted">{o.starts_on ? fmtDate(o.starts_on) : "No date"} · needs {o.skills.join(", ") || "any skills"}</p>
              </div>
              <div className="flex gap-2">
                <form action={setOpportunityPublished}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="published" value={o.published ? "0" : "1"} />
                  <button className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold hover:bg-brand-soft">{o.published ? "Close" : "Reopen"}</button></form>
                <form action={deleteOpportunity}><input type="hidden" name="id" value={o.id} />
                  <button aria-label="Delete opportunity" className="grid size-8 place-items-center rounded-full border border-line text-muted hover:text-red-600"><Trash2 className="size-4" /></button></form>
              </div>
            </div>
            <p className="mt-3"><strong>{joined.length}</strong> signed up{names.length > 0 && <span className="text-muted">: {names.join(", ")}</span>}</p>
            {(suggestedMembers.length > 0 || suggestedApplicants.length > 0) && (
              <div className="mt-3 rounded-2xl bg-surface-2 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suggested matches</p>
                <ul className="mt-2 space-y-1">
                  {suggestedMembers.map((p) => <li key={p.id}>{p.full_name || "(no name)"} <span className="text-muted">· account · {p.skills.filter((s) => o.skills.includes(s)).join(", ")}</span></li>)}
                  {suggestedApplicants.map((a) => <li key={a.id}>{a.full_name} <span className="text-muted">· <a href={`mailto:${a.email}`} className="text-brand">{a.email}</a> · {a.skills.filter((s) => o.skills.includes(s)).join(", ")}</span></li>)}
                </ul>
              </div>
            )}
          </Card>
        );
      })}
      {!opps?.length && <p className="text-sm text-muted">No opportunities yet.</p>}
    </div>
  );
}

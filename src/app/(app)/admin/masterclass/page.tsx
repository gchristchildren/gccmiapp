import Link from "next/link";
import { ActionButton } from "@/components/ActionButton";
import { OneOffFields } from "@/components/OneOffFields";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createCourse, setInterestStatus, setMembershipStatus } from "@/lib/actions/masterclass";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Masterclass" };
export const dynamic = "force-dynamic";

export default async function AdminMasterclass({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const { error, deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: courses }, { data: members }, { data: lessons }, { data: certs }, { data: profiles }, { data: interest }] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
    supabase.from("masterclass_memberships").select("*").order("created_at", { ascending: false }),
    supabase.from("lessons").select("id, course_id"),
    supabase.from("certificates").select("course_id"),
    supabase.from("profiles").select("id, full_name"),
    supabase.from("masterclass_interest").select("*").order("created_at", { ascending: false }),
  ]);
  const name = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "(no name)"]));
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  const pending = (members ?? []).filter((m) => m.status === "pending");
  const title = new Map((courses ?? []).map((c) => [c.id, c]));
  const waiting = (interest ?? []).filter((i) => i.status === "interested" && title.get(i.course_id)?.kind === "replay");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Masterclass</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {deleted && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Deleted.</p>}

      <Card>
        <h2 className="font-bold">Replay requests <span className="ml-1 rounded-full bg-line px-2 py-0.5 text-xs">{waiting.length} waiting</span></h2>
        <p className="mt-1 text-sm text-muted">Parents who asked for access to a replay video. Approve to show them the video link in their portal.</p>
        <ul className="mt-4 divide-y divide-line text-sm">
          {waiting.map((i) => (
            <li key={`${i.course_id}${i.profile_id}`} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span><strong>{name.get(i.profile_id)}</strong> <span className="text-muted">· {title.get(i.course_id)?.title}</span></span>
              <div className="flex gap-2">
                <ActionButton action={setInterestStatus} fields={{ course_id: i.course_id, profile_id: i.profile_id, status: "approved" }} className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-brand-fg hover:opacity-90">Approve</ActionButton>
                <ActionButton action={setInterestStatus} fields={{ course_id: i.course_id, profile_id: i.profile_id, status: "declined" }} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold hover:bg-brand-soft">Decline</ActionButton>
              </div>
            </li>
          ))}
          {!waiting.length && <li className="py-3 text-muted">No replay requests waiting.</li>}
        </ul>
      </Card>

      <Card>
        <h2 className="font-bold">Registrations <span className="ml-1 rounded-full bg-line px-2 py-0.5 text-xs">{pending.length} pending</span></h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {(members ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span><strong>{name.get(m.profile_id)}</strong> <span className="text-muted">· {m.year} · {m.status}</span></span>
              <div className="flex gap-2">
                {m.status !== "active" && (
                  <ActionButton action={setMembershipStatus} fields={{ id: m.id, status: "active" }} className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-brand-fg hover:opacity-90">Approve</ActionButton>
                )}
                {m.status !== "cancelled" && (
                  <ActionButton action={setMembershipStatus} fields={{ id: m.id, status: "cancelled" }} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold hover:bg-brand-soft">Cancel</ActionButton>
                )}
              </div>
            </li>
          ))}
          {!members?.length && <li className="py-3 text-muted">No registrations yet.</li>}
        </ul>
      </Card>

      <Card>
        <h2 className="font-bold">Add a Masterclass</h2>
        <form action={createCourse} className="mt-4 grid gap-4 sm:grid-cols-2">
          <OneOffFields inputClass={input} />
          <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Description<textarea name="description" rows={2} className={input} /></label>
          <label className="text-sm font-medium">Schedule (e.g. &ldquo;Tuesdays, 7pm&rdquo;)<input name="schedule_note" className={input} /></label>
          <label className="text-sm font-medium">Starts<input name="starts_on" type="date" className={input} /></label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Create</button>
        </form>
      </Card>

      {(courses ?? []).map((c) => {
        const mine = (interest ?? []).filter((i) => i.course_id === c.id);
        return (
          <Link key={c.id} href={`/admin/masterclass/${c.id}`} className="block rounded-3xl border border-line bg-surface p-5 text-sm shadow-card transition hover:-translate-y-0.5">
            <p className="text-base font-bold">
              {c.title}
              <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{c.kind === "live" ? "Live class" : c.kind === "replay" ? "Replay" : "Course"}</span>
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${c.published ? "bg-brand-soft text-brand" : "bg-gold-soft text-gold"}`}>{c.published ? "Published" : "Draft"}</span>
            </p>
            {c.kind === "course" ? (
              <p className="mt-1 text-muted">{(lessons ?? []).filter((l) => l.course_id === c.id).length} lessons · {(certs ?? []).filter((x) => x.course_id === c.id).length} certificates issued</p>
            ) : (
              <p className="mt-1 text-muted">
                {c.kind === "live" && c.event_at ? `${fmtDateTime(c.event_at)} · ` : ""}
                {mine.length} interested{c.kind === "replay" ? ` · ${mine.filter((i) => i.status === "approved").length} approved` : ""}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createCourse, setMembershipStatus } from "@/lib/actions/masterclass";

export const metadata = { title: "Masterclass" };
export const dynamic = "force-dynamic";

export default async function AdminMasterclass({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const { error, deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: courses }, { data: members }, { data: lessons }, { data: certs }, { data: profiles }] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
    supabase.from("masterclass_memberships").select("*").order("created_at", { ascending: false }),
    supabase.from("lessons").select("id, course_id"),
    supabase.from("certificates").select("course_id"),
    supabase.from("profiles").select("id, full_name"),
  ]);
  const name = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "(no name)"]));
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  const pending = (members ?? []).filter((m) => m.status === "pending");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Masterclass</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {deleted && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Course deleted.</p>}

      <Card>
        <h2 className="font-bold">Registrations <span className="ml-1 rounded-full bg-line px-2 py-0.5 text-xs">{pending.length} pending</span></h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {(members ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span><strong>{name.get(m.profile_id)}</strong> <span className="text-muted">· {m.year} · {m.status}</span></span>
              <div className="flex gap-2">
                {m.status !== "active" && (
                  <form action={setMembershipStatus}>
                    <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="active" />
                    <button className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-brand-fg hover:opacity-90">Approve</button>
                  </form>
                )}
                {m.status !== "cancelled" && (
                  <form action={setMembershipStatus}>
                    <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="cancelled" />
                    <button className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold hover:bg-brand-soft">Cancel</button>
                  </form>
                )}
              </div>
            </li>
          ))}
          {!members?.length && <li className="py-3 text-muted">No registrations yet.</li>}
        </ul>
      </Card>

      <Card>
        <h2 className="font-bold">Add a course</h2>
        <form action={createCourse} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required className={input} /></label>
          <label className="text-sm font-medium sm:col-span-2">Description<textarea name="description" rows={2} className={input} /></label>
          <label className="text-sm font-medium">Schedule (e.g. &ldquo;Tuesdays, 7pm&rdquo;)<input name="schedule_note" className={input} /></label>
          <label className="text-sm font-medium">Starts<input name="starts_on" type="date" className={input} /></label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Create course</button>
        </form>
      </Card>

      {(courses ?? []).map((c) => (
        <Link key={c.id} href={`/admin/masterclass/${c.id}`} className="block rounded-3xl border border-line bg-surface p-5 text-sm shadow-card transition hover:-translate-y-0.5">
          <p className="text-base font-bold">{c.title} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${c.published ? "bg-brand-soft text-brand" : "bg-gold-soft text-gold"}`}>{c.published ? "Published" : "Draft"}</span></p>
          <p className="mt-1 text-muted">{(lessons ?? []).filter((l) => l.course_id === c.id).length} lessons · {(certs ?? []).filter((x) => x.course_id === c.id).length} certificates issued</p>
        </Link>
      ))}
    </div>
  );
}

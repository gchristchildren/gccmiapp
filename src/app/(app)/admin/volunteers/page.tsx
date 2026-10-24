import { Card } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { volunteerSkills } from "@/lib/content";
import { deleteVolunteer, setVolunteerStatus, updateVolunteer } from "@/lib/actions/admin";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Volunteers" };
export const dynamic = "force-dynamic";

const statuses = ["new", "contacted", "active", "inactive"];

export default async function Volunteers({ searchParams }: { searchParams: Promise<{ error?: string; updated?: string; deleted?: string }> }) {
  const { error, updated, deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false });
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Volunteers</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {updated && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Volunteer updated.</p>}
      {deleted && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Volunteer deleted.</p>}
      {(data ?? []).map((v) => (
        <Card key={v.id} className="p-5 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold">{v.full_name}</p>
              <p className="text-muted"><a href={`mailto:${v.email}`} className="text-brand">{v.email}</a>{v.phone ? ` · ${v.phone}` : ""} · {fmtDate(v.created_at)}</p>
              {!!v.skills.length && <p className="mt-2 flex flex-wrap gap-1.5">{v.skills.map((s) => <span key={s} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">{s}</span>)}</p>}
              {v.message && <p className="mt-2">{v.message}</p>}
            </div>
            <form action={setVolunteerStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={v.id} />
              <select name="status" defaultValue={v.status} className="rounded-full border border-line bg-bg px-3 py-1.5 text-sm">
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button className="rounded-full border border-line px-4 py-1.5 font-semibold hover:bg-brand-soft">Update</button>
            </form>
          </div>

          <details className="mt-4 border-t border-line pt-4">
            <summary className="cursor-pointer font-semibold text-brand">Edit details</summary>
            <form action={updateVolunteer} className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={v.id} />
              <label className="font-medium">Full name<input name="full_name" required defaultValue={v.full_name} className={input} /></label>
              <label className="font-medium">Email<input name="email" type="email" required defaultValue={v.email} className={input} /></label>
              <label className="font-medium">Phone<input name="phone" defaultValue={v.phone ?? ""} className={input} /></label>
              <label className="font-medium">Status
                <select name="status" defaultValue={v.status} className={input}>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="font-medium">Skills</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {volunteerSkills.map((sk) => (
                    <label key={sk} className="cursor-pointer"><input type="checkbox" name="skills" value={sk} defaultChecked={v.skills.includes(sk)} className="peer sr-only" />
                      <span className="inline-block rounded-full border border-line px-3 py-1 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-fg">{sk}</span></label>
                  ))}
                </div>
              </fieldset>
              <label className="font-medium sm:col-span-2">Message<textarea name="message" rows={3} defaultValue={v.message ?? ""} className={input} /></label>
              <button className="rounded-full bg-brand px-6 py-2.5 font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Save changes</button>
            </form>
            <form action={deleteVolunteer} className="mt-4">
              <input type="hidden" name="id" value={v.id} />
              <ConfirmButton message={`Delete ${v.full_name}? This cannot be undone.`} className="rounded-full border border-red-500/40 px-5 py-2 font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">
                Delete volunteer
              </ConfirmButton>
            </form>
          </details>
        </Card>
      ))}
      {!data?.length && <p className="text-sm text-muted">No volunteer sign-ups yet.</p>}
    </div>
  );
}

import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { setVolunteerStatus } from "@/lib/actions/admin";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Volunteers" };
export const dynamic = "force-dynamic";

const statuses = ["new", "contacted", "active", "inactive"];

export default async function Volunteers() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false });
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Volunteers</h1>
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
        </Card>
      ))}
      {!data?.length && <p className="text-sm text-muted">No volunteer sign-ups yet.</p>}
    </div>
  );
}

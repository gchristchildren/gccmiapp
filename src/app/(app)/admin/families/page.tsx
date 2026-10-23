import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Families" };
export const dynamic = "force-dynamic";

export default async function Families() {
  const { supabase } = await requireAdmin();
  const [{ data: parents }, { data: kids }, { data: forms }, { data: sigs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "parent").order("created_at", { ascending: false }),
    supabase.from("children").select("*").order("first_name"),
    supabase.from("consent_forms").select("id").eq("required", true),
    supabase.from("consent_signatures").select("form_id, child_id"),
  ]);
  const signed = new Set((sigs ?? []).map((s) => `${s.form_id}:${s.child_id}`));

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Families</h1>
      <p className="text-sm text-muted">{parents?.length ?? 0} parents · {kids?.length ?? 0} children</p>
      {(parents ?? []).map((p) => {
        const mine = (kids ?? []).filter((k) => k.parent_id === p.id);
        return (
          <Card key={p.id} className="p-5 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="text-base font-bold">{p.full_name || "(no name)"}</p>
              <p className="text-xs text-muted">Joined {fmtDate(p.created_at)}</p>
            </div>
            <ul className="mt-3 space-y-2">
              {mine.map((k) => {
                const missing = (forms ?? []).filter((f) => !signed.has(`${f.id}:${k.id}`)).length;
                return (
                  <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-2 px-4 py-2.5">
                    <span><strong>{k.first_name} {k.last_name}</strong> <span className="text-muted">· ages {k.age_group}</span>{k.medical_notes && <span className="ml-2 text-xs text-gold">Medical note on file</span>}</span>
                    <span className={missing ? "text-xs font-semibold text-red-600 dark:text-red-400" : "text-xs font-semibold text-brand"}>
                      {missing ? `${missing} form${missing > 1 ? "s" : ""} unsigned` : "Consent complete"}
                    </span>
                  </li>
                );
              })}
              {!mine.length && <li className="text-muted">No children registered.</li>}
            </ul>
          </Card>
        );
      })}
      {!parents?.length && <p className="text-sm text-muted">No parents have signed up yet.</p>}
    </div>
  );
}

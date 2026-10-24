import { Card } from "@/components/ui";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { deleteChildAdmin, deleteFamily, updateChild, updateParent } from "@/lib/actions/admin";
import { ageGroups, fmtDate } from "@/lib/format";

export const metadata = { title: "Families" };
export const dynamic = "force-dynamic";

export default async function Families({ searchParams }: { searchParams: Promise<{ error?: string; updated?: string; deleted?: string }> }) {
  const { error, updated, deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: parents }, { data: kids }, { data: forms }, { data: sigs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "parent").order("created_at", { ascending: false }),
    supabase.from("children").select("*").order("first_name"),
    supabase.from("consent_forms").select("id").eq("required", true),
    supabase.from("consent_signatures").select("form_id, child_id"),
  ]);
  const signed = new Set((sigs ?? []).map((s) => `${s.form_id}:${s.child_id}`));
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  const danger = "rounded-full border border-red-500/40 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400";

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Families</h1>
      <p className="text-sm text-muted">{parents?.length ?? 0} parents · {kids?.length ?? 0} children</p>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {updated && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Saved.</p>}
      {deleted && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Deleted.</p>}

      {(parents ?? []).map((p) => {
        const mine = (kids ?? []).filter((k) => k.parent_id === p.id);
        return (
          <Card key={p.id} className="p-5 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-base font-bold">{p.full_name || "(no name)"}</p>
                <p className="text-xs text-muted">{p.phone ? `${p.phone} · ` : ""}Joined {fmtDate(p.created_at)}</p>
              </div>
              <form action={deleteFamily}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton
                  message={`Delete ${p.full_name || "this family"}'s account and ${mine.length} ${mine.length === 1 ? "child" : "children"}, including all their registrations and consents? This cannot be undone.`}
                  className={danger}
                >
                  Delete family
                </ConfirmButton>
              </form>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer font-semibold text-brand">Edit parent</summary>
              <form action={updateParent} className="mt-3 grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={p.id} />
                <label className="font-medium">Full name<input name="full_name" defaultValue={p.full_name} className={input} /></label>
                <label className="font-medium">Phone<input name="phone" defaultValue={p.phone ?? ""} className={input} /></label>
                <button className="rounded-full bg-brand px-6 py-2.5 font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Save parent</button>
              </form>
            </details>

            <ul className="mt-4 space-y-2">
              {mine.map((k) => {
                const missing = (forms ?? []).filter((f) => !signed.has(`${f.id}:${k.id}`)).length;
                return (
                  <li key={k.id} className="rounded-2xl bg-surface-2 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span><strong>{k.first_name} {k.last_name}</strong> <span className="text-muted">· {k.age_group}</span>{k.medical_notes && <span className="ml-2 text-xs text-gold">Medical note on file</span>}</span>
                      <span className={missing ? "text-xs font-semibold text-red-600 dark:text-red-400" : "text-xs font-semibold text-brand"}>
                        {missing ? `${missing} form${missing > 1 ? "s" : ""} unsigned` : "Consent complete"}
                      </span>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-brand">Edit child</summary>
                      <form action={updateChild} className="mt-3 grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="id" value={k.id} />
                        <label className="font-medium">First name<input name="first_name" required defaultValue={k.first_name} className={input} /></label>
                        <label className="font-medium">Last name<input name="last_name" required defaultValue={k.last_name} className={input} /></label>
                        <label className="font-medium">Date of birth<input name="date_of_birth" type="date" required defaultValue={k.date_of_birth} className={input} /></label>
                        <label className="font-medium">Age group
                          <select name="age_group" defaultValue={k.age_group} className={input}>{ageGroups.map((g) => <option key={g} value={g}>{g}</option>)}</select>
                        </label>
                        <label className="font-medium sm:col-span-2">Medical notes<textarea name="medical_notes" rows={2} defaultValue={k.medical_notes ?? ""} className={input} /></label>
                        <label className="flex items-center gap-3 sm:col-span-2"><input type="checkbox" name="photo_consent" defaultChecked={k.photo_consent} className="size-4 accent-[var(--brand)]" /> Photo consent given</label>
                        <button className="rounded-full bg-brand px-5 py-2 font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Save child</button>
                      </form>
                      <form action={deleteChildAdmin} className="mt-3">
                        <input type="hidden" name="id" value={k.id} />
                        <ConfirmButton message={`Delete ${k.first_name} ${k.last_name}? Their attendance and consents will be deleted. This cannot be undone.`} className={danger}>
                          Delete child
                        </ConfirmButton>
                      </form>
                    </details>
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

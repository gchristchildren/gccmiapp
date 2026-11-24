import { Trash2 } from "lucide-react";
import { AssignmentUpload } from "@/components/AssignmentUpload";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { addChild, confirmConsent, deleteChild, updatePhotoPermissions } from "@/lib/actions/portal";
import { ageGroups, ageLabel, photoUses } from "@/lib/format";

export const metadata = { title: "My children" };
export const dynamic = "force-dynamic";

type Flash = { error?: string; added?: string; photos?: string; consented?: string };

export default async function Children({ searchParams }: { searchParams: Promise<Flash> }) {
  const { error, added, photos, consented } = await searchParams;
  const { supabase, user } = await requireUser();
  const [{ data: kids }, { data: uploads }] = await Promise.all([
    supabase.from("children").select("*").order("created_at"),
    supabase.from("assignments").select("id, child_id, file_path, file_name, file_size, note, created_at").order("created_at", { ascending: false }),
  ]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  const ok = "rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">My children</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {added && <p role="status" className={ok}>Child added.</p>}
      {photos && <p role="status" className={ok}>Photo permissions saved.</p>}
      {consented && <p role="status" className={ok}>Thank you. Your consent is recorded.</p>}

      <div className="space-y-4">
        {(kids ?? []).map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">
                <p className="text-base font-bold">{c.first_name} {c.last_name}</p>
                <p className="text-muted">Age group {ageLabel(c.age_group)} · born {c.date_of_birth}</p>
                <p className="mt-1 text-xs text-muted">
                  {c.consent_at
                    ? `Parent consent recorded ${new Date(c.consent_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}`
                    : "Parent consent needed"}
                </p>
              </div>
              <form action={deleteChild}>
                <input type="hidden" name="id" value={c.id} />
                <button aria-label={`Remove ${c.first_name}`} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-red-600">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>

            {!c.consent_at && (
              <form action={confirmConsent} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={c.id} />
                <ConsentCheckbox />
                <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90 sm:w-fit">Confirm consent</button>
              </form>
            )}

            <details className="mt-4 border-t border-line pt-4">
              <summary className="cursor-pointer text-sm font-bold">Photo permissions</summary>
              <form action={updatePhotoPermissions} className="mt-3 space-y-2 text-sm">
                <input type="hidden" name="id" value={c.id} />
                <p className="text-xs text-muted">Choose where photos and video of {c.first_name} may be used. You can change this at any time.</p>
                {photoUses.map((u) => (
                  <label key={u.key} className="flex items-center gap-3">
                    <input type="checkbox" name={u.key} defaultChecked={c[u.key]} className="size-4 accent-[var(--brand)]" /> {u.label}
                  </label>
                ))}
                <button className="mt-1 rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-brand-soft">Save permissions</button>
              </form>
            </details>

            <AssignmentUpload childId={c.id} childName={c.first_name} profileId={user.id} items={(uploads ?? []).filter((a) => a.child_id === c.id)} />
          </Card>
        ))}
        {!kids?.length && <p className="text-sm text-muted">No children registered yet.</p>}
      </div>

      <Card>
        <h2 className="font-bold">Register a child</h2>
        <form action={addChild} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">First name<input name="first_name" required maxLength={100} className={input} /></label>
          <label className="text-sm font-medium">Last name<input name="last_name" required maxLength={100} className={input} /></label>
          <label className="text-sm font-medium">Date of birth<input name="date_of_birth" type="date" required className={input} /></label>
          <label className="text-sm font-medium">Age group
            <select name="age_group" required className={input} defaultValue="">
              <option value="" disabled>Choose…</option>
              {ageGroups.map((g) => <option key={g} value={g}>{ageLabel(g)}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium sm:col-span-2">Allergies or medical notes (optional)
            <textarea name="medical_notes" rows={2} className={input} />
          </label>
          <fieldset className="space-y-2 text-sm sm:col-span-2">
            <legend className="font-medium">Photo permissions (optional, one for each use)</legend>
            {photoUses.map((u) => (
              <label key={u.key} className="flex items-center gap-3">
                <input type="checkbox" name={u.key} className="size-4 accent-[var(--brand)]" /> I consent to photos and video of my child being used on: {u.label.toLowerCase()}
              </label>
            ))}
          </fieldset>
          <ConsentCheckbox />
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:col-span-2 sm:w-fit">Add child</button>
        </form>
        <p className="mt-3 text-xs text-muted">We only use this information to run Bible Club safely. You can remove your child at any time.</p>
      </Card>
    </div>
  );
}

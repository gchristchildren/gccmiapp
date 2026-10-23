import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { addChild, deleteChild } from "@/lib/actions/portal";
import { ageGroups } from "@/lib/format";

export const metadata = { title: "My children" };
export const dynamic = "force-dynamic";

export default async function Children({ searchParams }: { searchParams: Promise<{ error?: string; added?: string }> }) {
  const { error, added } = await searchParams;
  const { supabase } = await requireUser();
  const { data: kids } = await supabase.from("children").select("*").order("created_at");
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">My children</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {added && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Child added.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {(kids ?? []).map((c) => (
          <Card key={c.id} className="flex items-start justify-between gap-3 p-5">
            <div className="text-sm">
              <p className="text-base font-bold">{c.first_name} {c.last_name}</p>
              <p className="text-muted">Age group {c.age_group} · born {c.date_of_birth}</p>
              <p className="mt-1 text-xs text-muted">Photo consent: {c.photo_consent ? "Yes" : "No"}</p>
            </div>
            <form action={deleteChild}>
              <input type="hidden" name="id" value={c.id} />
              <button aria-label={`Remove ${c.first_name}`} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-red-600">
                <Trash2 className="size-4" />
              </button>
            </form>
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
              {ageGroups.map((g) => <option key={g} value={g}>{g} years</option>)}
            </select>
          </label>
          <label className="text-sm font-medium sm:col-span-2">Allergies or medical notes (optional)
            <textarea name="medical_notes" rows={2} className={input} />
          </label>
          <label className="flex items-start gap-3 text-sm sm:col-span-2">
            <input type="checkbox" name="photo_consent" className="mt-1 size-4 accent-[var(--brand)]" />
            I consent to photos of my child being used in GCCMI materials.
          </label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 sm:col-span-2 sm:w-fit">Add child</button>
        </form>
        <p className="mt-3 text-xs text-muted">We only use this information to run Bible Club safely. You can remove your child at any time.</p>
      </Card>
    </div>
  );
}

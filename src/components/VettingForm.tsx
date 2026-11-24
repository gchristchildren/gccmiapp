"use client";

import { useActionState, useEffect } from "react";
import { updateVetting, type VettingState } from "@/lib/actions/admin";
import { refereeStatuses } from "@/lib/format";
import type { Referee } from "@/lib/database.types";

/** References and checks for one volunteer. Shows errors inline; a successful save reloads the list. */
export function VettingForm({ id, referees, complete, notes }: { id: string; referees: Referee[]; complete: boolean; notes: string | null }) {
  const [state, action, pending] = useActionState<VettingState, FormData>(updateVetting, null);
  useEffect(() => {
    // A full page load is the reliable way to show the updated badge.
    if (state?.saved) window.location.assign("/admin/volunteers?updated=1");
  }, [state]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={id} />
      {referees.map((r, i) => (
        <div key={i} className="rounded-2xl bg-surface-2 p-4">
          <p className="font-semibold">{r.name} <span className="font-normal text-muted">· {r.relationship || "relationship not given"}</span></p>
          <p className="text-muted">
            {r.email && <a href={`mailto:${r.email}`} className="text-brand">{r.email}</a>}{r.email && r.phone ? " · " : ""}{r.phone}
          </p>
          <label className="mt-2 block font-medium">Reference status
            <select name={`ref_status_${i}`} defaultValue={r.status} className={input}>{refereeStatuses.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
        </div>
      ))}
      {!referees.length && <p className="text-muted">No referees were given at sign-up. Ask the volunteer for two before they work with children.</p>}
      <label className="flex items-center gap-3 font-medium"><input type="checkbox" name="vetting_complete" defaultChecked={complete} className="size-4 accent-[var(--brand)]" /> Checks complete (two references received and identity checked)</label>
      <label className="block font-medium">Notes (private)<textarea name="vetting_notes" rows={2} defaultValue={notes ?? ""} className={input} /></label>
      {state?.error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-red-600 dark:text-red-400">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-brand px-6 py-2.5 font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50 sm:w-fit">{pending ? "Saving…" : "Save references and checks"}</button>
    </form>
  );
}

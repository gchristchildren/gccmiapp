"use client";

import { useActionState } from "react";
import { recordQuiz, type QuizState } from "@/lib/actions/admin";

type Kid = { id: string; name: string; group: string };

/** Quiz entry: one title/date/total, then a score box for each child. Errors show here; success returns to the list. */
export function QuizForm({ groups, today }: { groups: { label: string; kids: Kid[] }[]; today: string }) {
  const [state, action, pending] = useActionState<QuizState, FormData>(recordQuiz, null);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm";
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium sm:col-span-3">Quiz title<input name="quiz_title" required className={input} placeholder="Bible Quiz: Easter 2027" /></label>
        <label className="text-sm font-medium">Date<input name="taken_on" type="date" required defaultValue={today} className={input} /></label>
        <label className="text-sm font-medium">Total marks<input name="out_of" type="number" min={1} max={1000} required defaultValue={10} className={input} /></label>
      </div>
      {groups.map((g) => (
        <fieldset key={g.label}>
          <legend className="text-sm font-bold">{g.label}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {g.kids.map((k) => (
              <label key={k.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-2 text-sm">
                <span>{k.name}</span>
                <input name={`score_${k.id}`} type="number" min={0} inputMode="numeric" aria-label={`Score for ${k.name}`} className="w-20 rounded-xl border border-line bg-bg px-3 py-1.5 text-right" />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {!groups.length && <p className="text-sm text-muted">No children are registered yet.</p>}
      <p className="text-xs text-muted">Leave a score blank for children who did not take part.</p>
      {state?.error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50">{pending ? "Saving…" : "Save scores"}</button>
    </form>
  );
}

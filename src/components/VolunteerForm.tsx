"use client";

import Link from "next/link";
import { useState } from "react";
import { volunteerSkills as skills } from "@/lib/content";


export function VolunteerForm() {
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; msg?: string }>({ kind: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: "busy" });
    const res = await fetch("/api/volunteer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        message: f.get("message"),
        skills: selected,
        referees: [1, 2].map((n) => ({ name: f.get(`ref${n}_name`), relationship: f.get(`ref${n}_relationship`), email: f.get(`ref${n}_email`), phone: f.get(`ref${n}_phone`) })),
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) setState({ kind: "done", msg: "Thank you! We'll be in touch with opportunities." });
    else setState({ kind: "error", msg: data.error ?? "Something went wrong. Please try again." });
  }

  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3";

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <label className="block text-sm font-medium">Full name<input name="name" required className={input} /></label>
      <label className="block text-sm font-medium">Email<input name="email" type="email" required className={input} /></label>
      <label className="block text-sm font-medium">Phone (optional)<input name="phone" type="tel" className={input} /></label>
      <fieldset>
        <legend className="text-sm font-medium">Your skills</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => {
            const on = selected.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSelected(on ? selected.filter((x) => x !== s) : [...selected, s])}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-brand bg-brand text-brand-fg" : "border-line hover:bg-brand-soft"}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="space-y-4 rounded-2xl border border-line p-4">
        <legend className="px-2 text-sm font-medium">Referees (optional now, needed before you work with children)</legend>
        <p className="text-xs text-muted">
          Give two people who know you and can speak about you, such as a church leader, employer or teacher (not family). Please tell
          them you have named them. We will contact them only about this role. See our <Link href="/privacy" className="font-medium text-brand">Privacy Notice</Link>.
        </p>
        {[1, 2].map((n) => (
          <div key={n} className="grid gap-3 sm:grid-cols-2">
            <p className="text-sm font-medium sm:col-span-2">Referee {n}</p>
            <label className="block text-sm">Name<input name={`ref${n}_name`} className={input} /></label>
            <label className="block text-sm">How they know you<input name={`ref${n}_relationship`} className={input} /></label>
            <label className="block text-sm">Email<input name={`ref${n}_email`} type="email" className={input} /></label>
            <label className="block text-sm">Phone<input name={`ref${n}_phone`} type="tel" className={input} /></label>
          </div>
        ))}
      </fieldset>
      <label className="block text-sm font-medium">Anything else? (availability, events you&apos;d like to help at)<textarea name="message" rows={4} className={input} /></label>
      {state.msg && (
        <p role="status" className={`rounded-2xl px-4 py-3 text-sm ${state.kind === "done" ? "bg-brand-soft text-brand" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
          {state.msg}
        </p>
      )}
      <button disabled={state.kind === "busy"} className="w-full rounded-full bg-brand px-6 py-3.5 font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50">
        {state.kind === "busy" ? "Sending…" : "Sign up to volunteer"}
      </button>
    </form>
  );
}

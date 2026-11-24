"use client";

import Link from "next/link";
import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; msg?: string }>({ kind: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: "busy" });
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: f.get("name"), email: f.get("email"), message: f.get("message"), website: f.get("website") }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) setState({ kind: "done", msg: "Thank you. Your message has been sent and we'll reply by email." });
    else setState({ kind: "error", msg: data.error ?? "Something went wrong. Please try again." });
  }

  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3";

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h2 className="text-xl font-bold">Send us a message</h2>
      <label className="block text-sm font-medium">Your name<input name="name" required autoComplete="name" className={input} /></label>
      <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
      <label className="block text-sm font-medium">Message<textarea name="message" required rows={5} maxLength={4000} className={input} /></label>
      <div className="hidden" aria-hidden="true">
        <label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <p className="text-xs text-muted">
        We use your details only to reply to you. See our <Link href="/privacy" className="font-medium text-brand">Privacy Policy</Link>.
      </p>
      {state.msg && (
        <p role="status" className={`rounded-2xl px-4 py-3 text-sm ${state.kind === "done" ? "bg-brand-soft text-brand" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
          {state.msg}
        </p>
      )}
      <button disabled={state.kind === "busy" || state.kind === "done"} className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50">
        {state.kind === "busy" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

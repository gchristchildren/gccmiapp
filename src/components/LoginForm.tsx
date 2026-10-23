"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/portal";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/portal";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(
    params.get("error") ? { kind: "error", text: "That link has expired. Please sign in again." } : null,
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    setBusy(true);
    setMsg(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ kind: "error", text: error.message });
      else {
        // Hard navigation: the router may hold a prefetched signed-out redirect for `next`.
        window.location.assign(next);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: String(f.get("name")) },
          emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) setMsg({ kind: "error", text: error.message });
      else if (data.session) {
        window.location.assign(next);
        return;
      } else setMsg({ kind: "ok", text: "Check your email for a confirmation link, then sign in." });
    }
    setBusy(false);
  }

  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3";

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="text-2xl font-bold">{mode === "signin" ? "Sign in" : "Create your parent account"}</h1>
      <p className="text-sm text-muted">
        {mode === "signin" ? "Access the parent portal." : "Register your children and get reminders."}
      </p>
      {mode === "signup" && (
        <label className="block text-sm font-medium">
          Full name
          <input name="name" required autoComplete="name" className={input} />
        </label>
      )}
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className={input}
        />
      </label>
      {msg && (
        <p
          role="status"
          className={`rounded-2xl px-4 py-3 text-sm ${msg.kind === "ok" ? "bg-brand-soft text-brand" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}
        >
          {msg.text}
        </p>
      )}
      <button
        disabled={busy}
        className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}
        className="w-full text-center text-sm font-medium text-brand"
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

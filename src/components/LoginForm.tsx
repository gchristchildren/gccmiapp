"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { countries } from "@/lib/countries";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "./PasswordInput";

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ kind: "error", text: error.message });
      else {
        // Note the sign-in for the admin analytics. Never blocks or breaks signing in.
        await Promise.resolve(supabase.from("login_events").insert({ profile_id: data.user.id })).catch(() => {});
        // Hard navigation: the router may hold a prefetched signed-out redirect for `next`.
        window.location.assign(next);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: String(f.get("name")), country: String(f.get("country")), email_updates: f.get("updates") === "on" },
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
      {mode === "signup" && (
        <label className="block text-sm font-medium">
          Country you live in
          <select name="country" required defaultValue="" className={input}>
            <option value="" disabled>Choose…</option>
            {countries.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      )}
      <label className="block text-sm font-medium">
        Password
        <PasswordInput
          name="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className={input}
        />
      </label>
      {mode === "signup" && (
        <div className="space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input type="checkbox" name="agree" required className="mt-1 size-4 accent-[var(--color-brand)]" />
            <span>I have read the <Link href="/privacy" target="_blank" className="font-medium text-brand">Privacy Policy</Link> and <Link href="/terms" target="_blank" className="font-medium text-brand">Terms of Use</Link>.</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" name="updates" className="mt-1 size-4 accent-[var(--color-brand)]" />
            <span>Email me class reminders and news (optional). You can unsubscribe at any time.</span>
          </label>
        </div>
      )}
      {mode === "signin" && (
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-brand">Forgot your password?</Link>
        </div>
      )}
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

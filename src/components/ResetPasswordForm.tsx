"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "./PasswordInput";

export function ResetPasswordForm() {
  // The email link signs the visitor in (see /auth/callback); without that session there is nothing to reset.
  const [ready, setReady] = useState<"checking" | "yes" | "no">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => setReady(data.session ? "yes" : "no"));
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    window.location.assign("/portal");
  }

  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3";
  const box = "mx-auto max-w-md space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8";

  if (ready === "no")
    return (
      <div className={box}>
        <h1 className="text-2xl font-bold">Link expired</h1>
        <p className="text-sm text-muted">This reset link has expired or was already used. Request a new one and open it in the same browser.</p>
        <Link href="/forgot-password" className="block rounded-full bg-brand px-6 py-3 text-center font-semibold text-brand-fg hover:opacity-90">
          Request a new link
        </Link>
      </div>
    );

  return (
    <form onSubmit={submit} className={box}>
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <p className="text-sm text-muted">Use at least 8 characters.</p>
      <label className="block text-sm font-medium">
        New password
        <PasswordInput name="password" required minLength={8} autoComplete="new-password" className={input} />
      </label>
      <label className="block text-sm font-medium">
        Confirm new password
        <PasswordInput name="confirm" required minLength={8} autoComplete="new-password" className={input} />
      </label>
      {error && <p role="status" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button disabled={busy || ready !== "yes"} className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50">
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}

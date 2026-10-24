"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const expired = useSearchParams().get("error") === "expired";
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    expired ? "That reset link has expired or was opened in a different browser. Request a new one below." : null,
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
    });
    setBusy(false);
    // Same message whether or not the address has an account, so the form can't be used to find accounts.
    if (error && error.status === 429) setError("Too many requests. Please wait a few minutes and try again.");
    else setSent(true);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      {sent ? (
        <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">
          If an account exists for that email, we&apos;ve sent a link to reset your password. Open it in this browser. It can take a few minutes to arrive, so check your spam folder too.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">Enter the email you signed up with and we&apos;ll send you a link to choose a new password.</p>
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3" />
          </label>
          {error && <p role="status" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button disabled={busy} className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50">
            {busy ? "Please wait…" : "Send reset link"}
          </button>
        </>
      )}
      <Link href="/login" className="block text-center text-sm font-medium text-brand">Back to sign in</Link>
    </form>
  );
}

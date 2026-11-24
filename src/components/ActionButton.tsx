"use client";

import { useState } from "react";

type Result = { error?: string } | void;

/**
 * A button that runs a server action and then reloads the page (or goes to `redirectTo`), so the screen always
 * shows the result. Use for admin buttons that change a list. The action must return instead of redirecting.
 */
export function ActionButton({
  action, fields, confirm, redirectTo, className, children,
}: {
  action: (f: FormData) => Promise<Result>;
  fields: Record<string, string>;
  confirm?: string;
  redirectTo?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setError(null);
    const f = new FormData();
    for (const [k, v] of Object.entries(fields)) f.append(k, v);
    try {
      const res = await action(f);
      if (res && res.error) {
        setError(res.error);
        setBusy(false);
        return;
      }
    } catch {
      setError("That didn't go through. Please try again.");
      setBusy(false);
      return;
    }
    window.location.assign(redirectTo ?? window.location.href);
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" disabled={busy} onClick={run} className={`${className ?? ""} disabled:opacity-50`}>{busy ? "Working…" : children}</button>
      {error && <span role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</span>}
    </span>
  );
}

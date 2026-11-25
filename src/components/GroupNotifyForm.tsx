"use client";

import { useActionState } from "react";
import { sendGroupNotification, type GroupResult } from "@/lib/actions/audiences";

export type GroupOption = { value: string; label: string; parents: number; reachable: number };

/** Sends a push notification to a saved group of parents and shows the result in place. */
export function GroupNotifyForm({ options, selected }: { options: GroupOption[]; selected?: string }) {
  const [state, action, pending] = useActionState(async (prev: GroupResult, f: FormData) => {
    const o = options.find((x) => x.value === f.get("audience"));
    if (o && !window.confirm(`Send this to ${o.reachable} of ${o.parents} parents in “${o.label}”? This cannot be taken back.`)) return prev;
    return sendGroupNotification(prev, f);
  }, {});
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">Send to
        <select name="audience" required defaultValue={selected ?? ""} className={input}>
          <option value="" disabled>Choose a group…</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label} ({o.parents} parents, {o.reachable} with notifications on)</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Title<input name="title" required maxLength={60} className={input} placeholder="Meeting for parents in Spain" /></label>
      <label className="block text-sm font-medium">Message<textarea name="body" required maxLength={140} rows={2} className={input} /></label>
      <label className="block text-sm font-medium">Opens (optional, a page on this site)<input name="url" className={input} placeholder="/portal/announcements" /></label>
      <button disabled={pending} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50">{pending ? "Sending…" : "Send to this group"}</button>
      {state.error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">{state.ok}</p>}
    </form>
  );
}

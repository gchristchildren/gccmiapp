"use client";

import { useState } from "react";
import { saveAudience } from "@/lib/actions/audiences";

/** Saves the current Parents-page selection as a named group. */
export function SaveAudienceForm({ query }: { query: string }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    const f = new FormData();
    f.set("name", name);
    f.set("query", query);
    try {
      const r = await saveAudience(f);
      if (r.error) setMsg({ ok: false, text: r.error });
      else {
        setMsg({ ok: true, text: "Saved. You can now pick it when sending a notification." });
        setName("");
      }
    } catch {
      setMsg({ ok: false, text: "That didn't go through. Please try again." });
    }
    setBusy(false);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Name this group, e.g. Spain parents" aria-label="Group name" className="min-w-64 rounded-full border border-line bg-bg px-4 py-2 text-sm" />
      <button type="button" disabled={busy || !name.trim()} onClick={save} className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-brand-soft disabled:opacity-50">{busy ? "Saving…" : "Save this group"}</button>
      {msg && <span role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-brand" : "text-red-600 dark:text-red-400"}`}>{msg.text}</span>}
    </div>
  );
}

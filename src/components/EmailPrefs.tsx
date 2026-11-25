"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Lets a parent say whether GCCMI may send them news and updates by email. */
export function EmailPrefs({ userId, initial }: { userId: string; initial: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(next: boolean) {
    setBusy(true);
    setError("");
    const { error } = await createClient().from("profiles").update({ email_updates: next }).eq("id", userId);
    setBusy(false);
    if (error) return setError("Could not save that. Please try again.");
    setOn(next);
    router.refresh();
  }

  return (
    <div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={on} disabled={busy} onChange={(e) => change(e.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
        <span>
          <span className="font-semibold">Send me news and updates by email</span>
          <span className="block text-muted">You can change this at any time. Emails about your own children and classes are not affected.</span>
        </span>
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

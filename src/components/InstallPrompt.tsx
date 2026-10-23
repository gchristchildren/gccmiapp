"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

/** Registers the service worker and offers an "Install app" button where the browser supports it. */
export function InstallPrompt() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!evt) {
    return (
      <p className="text-xs text-muted">
        iPhone: tap Share, then “Add to Home Screen” to install the app and get reminders.
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={() => evt.prompt().then(() => setEvt(null))}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-brand-soft"
    >
      <Download className="size-4" /> Install app
    </button>
  );
}

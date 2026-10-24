"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription } from "@/lib/actions/push";

type State = "loading" | "unsupported" | "needs-install" | "denied" | "off" | "on" | "busy";

function keyToBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Lets a signed-in user turn push reminders on or off for this device. */
export function PushToggle({ publicKey }: { publicKey: string | null }) {
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        // iPhones only get push once the app is added to the home screen.
        const ios = /iphone|ipad/i.test(navigator.userAgent);
        const standalone = window.matchMedia("(display-mode: standalone)").matches;
        return setState(ios && !standalone ? "needs-install" : "unsupported");
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, [publicKey]);

  async function enable() {
    setError("");
    setState("busy");
    try {
      if ((await Notification.requestPermission()) !== "granted") return setState("denied");
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey!) }));
      const res = await savePushSubscription(sub.toJSON());
      if (!res.ok) throw new Error("save failed");
      setState("on");
    } catch {
      setError("We couldn't turn reminders on. Please try again.");
      setState("off");
    }
  }

  async function disable() {
    setState("busy");
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setState("off");
  }

  const note: Partial<Record<State, string>> = {
    unsupported: "This browser doesn't support push reminders.",
    "needs-install": "On iPhone, tap Share then “Add to Home Screen”, then open the app from your home screen to turn reminders on.",
    denied: "Notifications are blocked for this site. Allow them in your browser settings to get reminders.",
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm">
        <p className="font-semibold">Reminders on this device</p>
        <p className="text-muted">
          {note[state] ?? (state === "on" ? "On. You'll get session reminders and announcements." : "Get “Bible Club starts tomorrow” and other reminders as notifications.")}
        </p>
        {error && <p role="alert" className="mt-1 text-red-600 dark:text-red-400">{error}</p>}
      </div>
      {(state === "off" || state === "on" || state === "busy") && (
        <button
          type="button"
          disabled={state === "busy"}
          onClick={state === "on" ? disable : enable}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${state === "on" ? "border border-line hover:bg-brand-soft" : "bg-brand text-brand-fg hover:opacity-90"}`}
        >
          {state === "on" ? <><BellOff className="size-4" /> Turn off</> : <><Bell className="size-4" /> Turn on</>}
        </button>
      )}
    </div>
  );
}

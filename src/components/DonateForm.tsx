"use client";

import { Heart, Lock } from "lucide-react";
import { useState } from "react";

const types = [
  { id: "one-off", label: "One-off" },
  { id: "monthly", label: "Monthly" },
  { id: "sponsorship", label: "Sponsorship" },
] as const;

const presets = [10, 25, 50, 100];

type Props = { paypalUrl: string | null; justGivingUrl: string | null };

export function DonateForm({ paypalUrl, justGivingUrl }: Props) {
  const [type, setType] = useState<(typeof types)[number]["id"]>("one-off");
  const [preset, setPreset] = useState<number | null>(25);
  const [custom, setCustom] = useState("");
  const [giftAid, setGiftAid] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const amount = preset ?? Number(custom);
  const suffix = type === "one-off" ? "" : " / month";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, giftAid, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong. Please try again.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <form onSubmit={submit} className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div role="tablist" aria-label="Donation type" className="grid grid-cols-3 gap-1 rounded-full bg-brand-soft p-1">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={type === t.id}
              onClick={() => setType(t.id)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${type === t.id ? "bg-surface shadow-sm" : "text-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {type === "sponsorship" && (
          <p className="mt-3 text-sm text-muted">Sponsor a child or project with a regular monthly gift.</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPreset(p); setCustom(""); }}
              aria-pressed={preset === p}
              className={`rounded-2xl border px-4 py-3 text-lg font-bold transition ${preset === p ? "border-brand bg-brand-soft text-brand" : "border-line hover:bg-brand-soft"}`}
            >
              £{p}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm font-medium">
          Other amount (£)
          <input
            type="number"
            inputMode="decimal"
            min={1}
            max={10000}
            step="0.01"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setPreset(null); }}
            className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3"
            placeholder="Enter amount"
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Your name (optional)
          <input
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3"
          />
        </label>

        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={giftAid} onChange={(e) => setGiftAid(e.target.checked)} className="mt-1 size-4 accent-[var(--brand)]" />
          <span>
            I am a UK taxpayer and want GCCMI to claim Gift Aid on this donation.
            <span className="block text-xs text-muted">We&apos;ll confirm your address with you before claiming.</span>
          </span>
        </label>

        {error && <p role="alert" className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy || !(amount >= 1)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-brand-fg transition hover:opacity-90 disabled:opacity-50"
        >
          <Heart className="size-4" />
          {busy ? "Redirecting…" : amount >= 1 ? `Donate £${amount}${suffix}` : "Choose an amount"}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Lock className="size-3" /> Secure card payment by Stripe
        </p>
      </form>

      {(paypalUrl || justGivingUrl) && (
        <div className="rounded-3xl border border-line bg-surface p-6 text-center shadow-card">
          <p className="text-sm text-muted">Prefer another way to give?</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {paypalUrl && <a href={paypalUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-brand-soft">Give with PayPal</a>}
            {justGivingUrl && <a href={justGivingUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-brand-soft">Give on JustGiving</a>}
          </div>
        </div>
      )}
    </div>
  );
}

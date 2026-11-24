"use client";

import { useActionState, useEffect } from "react";
import { updateEvent, type EventState } from "@/lib/actions/admin";
import { eventCategories } from "@/lib/content";

type Event = { id: string; title: string; category: string; starts_on: string; time_label: string; venue: string; address: string; summary: string; register_url: string | null; published: boolean };

/** Edit form for one event. Errors show here; a successful save reloads the page with a confirmation. */
export function EventEditForm({ event }: { event: Event }) {
  const [state, action, pending] = useActionState<EventState, FormData>(updateEvent, null);
  useEffect(() => {
    if (state?.saved) window.location.assign(`/admin/events/${event.id}?updated=1`);
  }, [state, event.id]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={event.id} />
      <label className="text-sm font-medium sm:col-span-2">Title<input name="title" required defaultValue={event.title} className={input} /></label>
      <label className="text-sm font-medium">Category
        <select name="category" defaultValue={event.category} className={input}>{eventCategories.map((c) => <option key={c}>{c}</option>)}</select>
      </label>
      <label className="text-sm font-medium">Date<input name="starts_on" type="date" required defaultValue={event.starts_on} className={input} /></label>
      <label className="text-sm font-medium">Time<input name="time_label" defaultValue={event.time_label} placeholder="10:00 – 12:00" className={input} /></label>
      <label className="text-sm font-medium">Venue<input name="venue" defaultValue={event.venue} className={input} /></label>
      <label className="text-sm font-medium sm:col-span-2">Address (used for the map link)<input name="address" defaultValue={event.address} className={input} /></label>
      <label className="text-sm font-medium sm:col-span-2">Summary<textarea name="summary" rows={3} defaultValue={event.summary} className={input} /></label>
      <label className="text-sm font-medium sm:col-span-2">Registration link (optional, https://)<input name="register_url" type="url" defaultValue={event.register_url ?? ""} className={input} /></label>
      <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="published" defaultChecked={event.published} className="size-4 accent-[var(--brand)]" /> Visible on the Events page</label>
      {state?.error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 sm:col-span-2">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90 disabled:opacity-50 sm:w-fit">{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

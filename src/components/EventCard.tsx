import { CalendarDays, Check, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { cancelEventRegistration, registerForEvent } from "@/lib/actions/events";
import { formatDate, type GccEvent } from "@/lib/content";

type Props = {
  event: GccEvent;
  past?: boolean;
  /** Registration state for the signed-in user. Omit on public/cached pages to show a "Details" link. */
  registered?: boolean;
  compact?: boolean;
};

export function EventCard({ event, past = false, registered = false, compact = false }: Props) {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;
  const btn = "rounded-full px-4 py-2 text-sm font-semibold transition";
  return (
    <article className="flex flex-col rounded-3xl border border-line bg-surface p-5 shadow-card">
      <span className="w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{event.category}</span>
      <h3 className="mt-3 text-lg font-bold">{event.title}</h3>
      <p className="mt-1 text-sm text-muted">{event.summary}</p>
      <ul className="mt-4 space-y-1.5 text-sm">
        <li className="flex items-center gap-2"><CalendarDays className="size-4 text-brand" />{formatDate(event.date)}</li>
        {event.time && <li className="flex items-center gap-2"><Clock className="size-4 text-brand" />{event.time}</li>}
        <li className="flex items-center gap-2"><MapPin className="size-4 text-brand" />{event.venue}</li>
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
        {past ? (
          <span className="text-xs text-muted">Photos, videos and testimonials coming soon.</span>
        ) : (
          <>
            {compact ? (
              <Link href="/events" className={`${btn} bg-brand text-brand-fg hover:opacity-90`}>Details &amp; register</Link>
            ) : event.registerUrl ? (
              <a href={event.registerUrl} target="_blank" rel="noopener noreferrer" className={`${btn} bg-brand text-brand-fg hover:opacity-90`}>Register</a>
            ) : registered ? (
              <form action={cancelEventRegistration} className="flex items-center gap-2">
                <input type="hidden" name="event_id" value={event.id} />
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand"><Check className="size-4" /> You&apos;re registered</span>
                <button className="text-xs text-muted underline">Cancel</button>
              </form>
            ) : (
              <form action={registerForEvent}>
                <input type="hidden" name="event_id" value={event.id} />
                <button className={`${btn} bg-brand text-brand-fg hover:opacity-90`}>Register</button>
              </form>
            )}
            <a href={map} target="_blank" rel="noopener noreferrer" className={`${btn} border border-line hover:bg-brand-soft`}>Map</a>
          </>
        )}
      </div>
    </article>
  );
}

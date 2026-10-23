import { CalendarDays, Clock, MapPin } from "lucide-react";
import { formatDate, type GccEvent } from "@/lib/content";

export function EventCard({ event, past = false }: { event: GccEvent; past?: boolean }) {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;
  return (
    <article className="flex flex-col rounded-3xl border border-line bg-surface p-5 shadow-card">
      <span className="w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{event.category}</span>
      <h3 className="mt-3 text-lg font-bold">{event.title}</h3>
      <p className="mt-1 text-sm text-muted">{event.summary}</p>
      <ul className="mt-4 space-y-1.5 text-sm">
        <li className="flex items-center gap-2"><CalendarDays className="size-4 text-brand" />{formatDate(event.date)}</li>
        <li className="flex items-center gap-2"><Clock className="size-4 text-brand" />{event.time}</li>
        <li className="flex items-center gap-2"><MapPin className="size-4 text-brand" />{event.venue}</li>
      </ul>
      <div className="mt-5 flex gap-2 pt-1">
        {past ? (
          <span className="text-xs text-muted">Photos, videos and testimonials coming soon.</span>
        ) : (
          <>
            <a href={event.registerUrl ?? "/programmes/bible-club"} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-fg hover:opacity-90">
              Register
            </a>
            <a href={map} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-brand-soft">
              Map
            </a>
          </>
        )}
      </div>
    </article>
  );
}

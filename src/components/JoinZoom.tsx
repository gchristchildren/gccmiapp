import { Video } from "lucide-react";

const HOUR = 3_600_000;

/**
 * "Join on Zoom" for one session. The link itself comes from the database only when the family's child is in the
 * session's age group and class is about to start (or running), so outside that window there is nothing to show
 * but a reminder of when it will appear.
 */
export function JoinZoom({ url, startsAt }: { url?: string; startsAt: string }) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg hover:opacity-90">
        <Video className="size-4" /> Join on Zoom
      </a>
    );
  }
  const away = new Date(startsAt).getTime() - Date.now();
  if (away > 0 && away < 24 * HOUR) {
    return <p className="mt-3 text-xs text-muted">The Join on Zoom button appears here 30 minutes before class.</p>;
  }
  return null;
}

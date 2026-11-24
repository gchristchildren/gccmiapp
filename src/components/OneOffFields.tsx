"use client";

import { useState } from "react";

/** The "what kind of Masterclass is this" fields: course, one-off live class, or replay. */
export function OneOffFields({ kind = "course", eventAt = "", link = "", inputClass }: { kind?: string; eventAt?: string; link?: string; inputClass: string }) {
  const [k, setK] = useState(kind);
  return (
    <>
      <label className="text-sm font-medium sm:col-span-2">
        Type
        <select name="kind" value={k} onChange={(e) => setK(e.target.value)} className={inputClass}>
          <option value="course">Course (several lessons, for annual members)</option>
          <option value="live">One-off live class (parents say they are interested in attending)</option>
          <option value="replay">Replay (parents ask for access to the video)</option>
        </select>
      </label>
      {k === "live" && (
        <label className="text-sm font-medium">
          Date and time (UK time)
          <input name="event_at" type="datetime-local" required defaultValue={eventAt} className={inputClass} />
        </label>
      )}
      {k !== "course" && (
        <label className={`text-sm font-medium ${k === "live" ? "" : "sm:col-span-2"}`}>
          {k === "live" ? "Join link (Zoom). Interested parents see it from 30 minutes before." : "Video link (https://). Only approved parents see it."}
          <input name="link_url" type="url" defaultValue={link} placeholder="https://" className={inputClass} />
        </label>
      )}
    </>
  );
}

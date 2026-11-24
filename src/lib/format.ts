const tz = "Europe/London";

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: tz });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz,
  });

export const fmtMoney = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pence / 100);

// The groups GCCMI uses for Bible Club classes (see gccmi.co.uk).
export const ageGroups = ["Kids", "Pre-Teens", "Teens"] as const;

const ageBrackets: Record<string, string> = { Kids: "Kids (4–8)", "Pre-Teens": "Pre-Teens (9–12)", Teens: "Teens (13–18)" };

/** Display name for an age group, with its age bracket. The stored value stays "Kids", "Pre-Teens" or "Teens". */
export const ageLabel = (group: string) => (group === "all" ? "All ages" : (ageBrackets[group] ?? group));

/** Turns a datetime-local value typed in UK time into an ISO timestamp. */
export function ukLocalToIso(value: string) {
  // Interpret as Europe/London by finding the offset on that date.
  const asUtc = new Date(value + "Z");
  const londonAsUtc = new Date(asUtc.toLocaleString("en-US", { timeZone: tz }));
  const offset = londonAsUtc.getTime() - asUtc.getTime();
  return new Date(asUtc.getTime() - offset).toISOString();
}

/** Turns an ISO timestamp into the value a datetime-local input expects, in UK time. */
export function isoToUkLocal(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

/** Photo permissions are given separately for each use (Photo, Video and Media Policy). */
export const photoUses = [
  { key: "photo_website", label: "Website" },
  { key: "photo_social", label: "Social media" },
  { key: "photo_print", label: "Printed materials" },
  { key: "photo_funding", label: "Funding applications" },
] as const;

/** Version recorded with each parent consent, so we know which wording they agreed to. */
export const CONSENT_VERSION = "policy-pack-1.0";

export const refereeStatuses = ["not contacted", "requested", "received", "declined"] as const;

/** A Zoom link must be an https address (the database enforces the same rule). */
export const isHttpsUrl = (u: string) => /^https:\/\/\S+$/i.test(u) && u.length <= 500;

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

export const ageLabel = (group: string) => (group === "all" ? "All ages" : group);

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

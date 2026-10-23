const tz = "Europe/London";

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: tz });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz,
  });

export const fmtMoney = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pence / 100);

export const ageGroups = ["3-5", "6-8", "9-12", "13-17"] as const;

/** Turns a datetime-local value typed in UK time into an ISO timestamp. */
export function ukLocalToIso(value: string) {
  // Interpret as Europe/London by finding the offset on that date.
  const asUtc = new Date(value + "Z");
  const londonAsUtc = new Date(asUtc.toLocaleString("en-US", { timeZone: tz }));
  const offset = londonAsUtc.getTime() - asUtc.getTime();
  return new Date(asUtc.getTime() - offset).toISOString();
}

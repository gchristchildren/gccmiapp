/** Small dependency-free bar chart. Values are drawn as bars with the number above each bar. */
export function BarChart({
  data,
  unit = "",
  height = 160,
  emptyLabel = "No data yet",
}: {
  data: { label: string; value: number; muted?: boolean }[];
  unit?: string;
  height?: number;
  emptyLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const empty = data.every((d) => d.value === 0);
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }} role="img" aria-label={data.map((d) => `${d.label}: ${d.value}${unit}`).join(", ")}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-medium text-muted">{d.value ? `${unit === "£" ? "£" : ""}${Math.round(d.value)}${unit === "%" ? "%" : ""}` : ""}</span>
            <div
              className={`w-full rounded-t-lg ${d.muted ? "bg-line" : "bg-brand"}`}
              style={{ height: `${Math.max((d.value / max) * (height - 28), d.value ? 4 : 2)}px`, opacity: d.muted ? 1 : 0.9 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[11px] text-muted">{d.label}</span>
        ))}
      </div>
      {empty && <p className="mt-2 text-center text-xs text-muted">{emptyLabel}</p>}
    </div>
  );
}

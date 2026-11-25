import { applyAudience, loadParents, parseAudience } from "@/lib/audience";
import { requireAdmin } from "@/lib/auth";
import { ageLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

// Stops spreadsheet programs running a cell as a formula (=, +, -, @ at the start).
function cell(v: string | number | boolean) {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
const csv = (rows: (string | number | boolean)[][]) => rows.map((r) => r.map(cell).join(",")).join("\r\n");
const date = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

export async function GET(req: Request) {
  const { supabase, user } = await requireAdmin();
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") === "full" ? "full" : "emails";
  const filter = parseAudience(Object.fromEntries([...new Set(url.searchParams.keys())].map((k) => [k, url.searchParams.getAll(k)])));
  const rows = applyAudience(await loadParents(supabase), filter);

  // Every download is recorded before it is handed over.
  const { error } = await supabase
    .from("export_log")
    .insert({ admin_id: user.id, kind, filter: JSON.parse(JSON.stringify(filter)), row_count: rows.length });
  if (error) return new Response("Could not record the download, so it was not made.", { status: 500 });

  const body =
    kind === "emails"
      ? csv([["Name", "Email", "Country", "Agreed to news emails"], ...rows.map((r) => [r.name, r.email, r.country, r.news ? "Yes" : "No"])])
      : csv([
          ["Name", "Email", "Phone", "Country", "Number of children", "Children", "Joined", "Last sign-in", "Notifications on", "Masterclass member", "Agreed to news emails"],
          ...rows.map((r) => [
            r.name, r.email, r.phone, r.country, r.children.length,
            r.children.map((c) => `${c.name} (${ageLabel(c.ageGroup)})`).join("; "),
            date(r.joined), date(r.lastSignIn), r.pushOn ? "Yes" : "No", r.masterclass ? "Yes" : "No", r.news ? "Yes" : "No",
          ]),
        ]);
  const name = `gccmi-parents-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response("﻿" + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

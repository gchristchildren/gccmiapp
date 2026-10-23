import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { fmtDate, fmtMoney } from "@/lib/format";

export const metadata = { title: "Donations" };
export const dynamic = "force-dynamic";

export default async function Donations() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(200);
  const total = (data ?? []).reduce((n, d) => n + d.amount_pence, 0);
  const giftAid = (data ?? []).filter((d) => d.gift_aid).reduce((n, d) => n + d.amount_pence, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Donations</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs uppercase tracking-wide text-muted">Total (shown)</p><p className="mt-1 text-3xl font-bold">{fmtMoney(total)}</p></Card>
        <Card className="p-5"><p className="text-xs uppercase tracking-wide text-muted">Gifts</p><p className="mt-1 text-3xl font-bold">{data?.length ?? 0}</p></Card>
        <Card className="p-5"><p className="text-xs uppercase tracking-wide text-muted">Gift Aid eligible</p><p className="mt-1 text-3xl font-bold">{fmtMoney(giftAid)}</p></Card>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr><th className="p-4">Date</th><th className="p-4">Donor</th><th className="p-4">Type</th><th className="p-4">Gift Aid</th><th className="p-4 text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((d) => (
              <tr key={d.id}>
                <td className="p-4">{fmtDate(d.created_at)}</td>
                <td className="p-4">{d.donor_name || d.donor_email || "Anonymous"}</td>
                <td className="p-4">{d.donation_type}</td>
                <td className="p-4">{d.gift_aid ? "Yes" : "No"}</td>
                <td className="p-4 text-right font-semibold">{fmtMoney(d.amount_pence)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && <p className="p-6 text-sm text-muted">No donations recorded yet. Gifts appear here once the Stripe webhook is connected.</p>}
      </Card>
    </div>
  );
}

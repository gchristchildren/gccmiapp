import { Check, Download } from "lucide-react";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { signConsent } from "@/lib/actions/portal";

export const metadata = { title: "Consent forms" };
export const dynamic = "force-dynamic";

export default async function Forms() {
  const { supabase, user } = await requireUser();
  const [{ data: forms }, { data: kids }, { data: sigs }] = await Promise.all([
    supabase.from("consent_forms").select("*").order("created_at"),
    supabase.from("children").select("id, first_name"),
    supabase.from("consent_signatures").select("form_id, child_id").eq("signed_by", user.id),
  ]);
  const signed = new Set((sigs ?? []).map((s) => `${s.form_id}:${s.child_id}`));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Consent forms</h1>
      {(forms ?? []).map((f) => (
        <Card key={f.id} className="p-5 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold">{f.title}{f.required && <span className="ml-2 text-xs font-medium text-gold">Required</span>}</p>
              {f.description && <p className="mt-1 text-muted">{f.description}</p>}
            </div>
            {f.file_url && (
              <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-semibold hover:bg-brand-soft">
                <Download className="size-4" /> Download
              </a>
            )}
          </div>
          <ul className="mt-4 space-y-2">
            {(kids ?? []).map((k) => (
              <li key={k.id} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-2.5">
                <span>{k.first_name}</span>
                {signed.has(`${f.id}:${k.id}`) ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-brand"><Check className="size-4" /> Consent given</span>
                ) : (
                  <form action={signConsent}>
                    <input type="hidden" name="form_id" value={f.id} />
                    <input type="hidden" name="child_id" value={k.id} />
                    <button className="rounded-full bg-brand px-4 py-1.5 font-semibold text-brand-fg hover:opacity-90">I consent</button>
                  </form>
                )}
              </li>
            ))}
            {!kids?.length && <li className="text-muted">Add a child to give consent.</li>}
          </ul>
        </Card>
      ))}
      {!forms?.length && <p className="text-sm text-muted">No forms to complete right now.</p>}
    </div>
  );
}

import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createConsentForm } from "@/lib/actions/admin";

export const metadata = { title: "Consent forms" };
export const dynamic = "force-dynamic";

export default async function AdminForms({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: forms }, { data: sigs }] = await Promise.all([
    supabase.from("consent_forms").select("*").order("created_at"),
    supabase.from("consent_signatures").select("form_id"),
  ]);
  const input = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Consent forms</h1>
      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Card>
        <h2 className="font-bold">Add a form</h2>
        <form action={createConsentForm} className="mt-4 space-y-4">
          <label className="block text-sm font-medium">Title<input name="title" required className={input} /></label>
          <label className="block text-sm font-medium">Description<textarea name="description" rows={2} className={input} /></label>
          <label className="block text-sm font-medium">Link to the form (PDF), https://<input name="file_url" type="url" className={input} /></label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="required" defaultChecked className="size-4 accent-[var(--brand)]" /> Required for every child</label>
          <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-fg hover:opacity-90">Add form</button>
        </form>
      </Card>
      {(forms ?? []).map((f) => (
        <Card key={f.id} className="p-5 text-sm">
          <p className="text-base font-bold">{f.title}{f.required && <span className="ml-2 text-xs text-gold">Required</span>}</p>
          {f.description && <p className="text-muted">{f.description}</p>}
          <p className="mt-1 text-xs font-medium text-brand">{(sigs ?? []).filter((s) => s.form_id === f.id).length} signed</p>
        </Card>
      ))}
    </div>
  );
}

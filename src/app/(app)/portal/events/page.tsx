import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Events for you" };
export const dynamic = "force-dynamic";

/** Events GCCMI has chosen for this family. Row-level security only returns the ones that match this parent. */
export default async function PortalEvents() {
  const { supabase } = await requireUser();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from("events").select("*").not("audience_rule", "is", null).gte("starts_on", today).order("starts_on");
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Events for you</h1>
        <p className="text-sm text-muted">Events chosen for families like yours. They are not shown on the public website. Our open events are on the <Link href="/events" className="font-semibold text-brand hover:underline">Events page</Link>.</p>
      </div>
      {(data ?? []).map((e) => (
        <Card key={e.id} className="p-5 text-sm">
          <p className="text-base font-bold">{e.title}</p>
          <p className="text-muted">{e.category} · {fmtDate(e.starts_on)}{e.time_label ? ` · ${e.time_label}` : ""}</p>
          {(e.venue || e.address) && (
            <p className="mt-2 flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>{[e.venue, e.address].filter(Boolean).join(", ")}</span>
            </p>
          )}
          {e.summary && <p className="mt-2 whitespace-pre-line">{e.summary}</p>}
          {e.register_url && (
            <a href={e.register_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-fg hover:opacity-90">
              Register <ExternalLink className="size-4" aria-hidden />
            </a>
          )}
        </Card>
      ))}
      {!data?.length && <p className="text-sm text-muted">Nothing for you right now. We will tell you when there is.</p>}
    </div>
  );
}

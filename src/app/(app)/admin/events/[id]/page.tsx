import Link from "next/link";
import { notFound } from "next/navigation";
import { EventEditForm } from "@/components/EventEditForm";
import { EventMediaManager } from "@/components/EventMediaManager";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { deleteEvent } from "@/lib/actions/admin";

export const metadata = { title: "Edit event" };
export const dynamic = "force-dynamic";

export default async function EditEvent({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ updated?: string }> }) {
  const { id } = await params;
  const { updated } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: event }, { data: media }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("event_media").select("id, kind, path, thumb_path, embed_url, caption").eq("event_id", id).order("created_at"),
  ]);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/events" className="text-sm font-medium text-brand">← All events</Link>
        <h1 className="mt-1 text-2xl font-bold">{event.title}</h1>
        <p className="text-sm text-muted">
          <Link href={`/events/${event.slug}`} className="font-medium text-brand" target="_blank">View on the website</Link>
        </p>
      </div>
      {updated && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">Event updated.</p>}
      <Card>
        <h2 className="mb-4 font-bold">Event details</h2>
        <EventEditForm event={event} />
        <form action={deleteEvent} className="mt-6 border-t border-line pt-4">
          <input type="hidden" name="id" value={event.id} />
          <ConfirmButton message={`Delete "${event.title}", its sign-ups and all its photos and videos? This cannot be undone.`} className="rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">
            Delete event
          </ConfirmButton>
        </form>
      </Card>
      <Card>
        <h2 className="mb-1 font-bold">Photos and videos</h2>
        <p className="mb-4 text-sm text-muted">Shown on the event&apos;s page once it is visible. Visitors can open each photo and play each video.</p>
        <EventMediaManager eventId={event.id} items={media ?? []} />
      </Card>
    </div>
  );
}

import { CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { MediaGallery } from "@/components/MediaGallery";
import { ButtonLink, Container, PageHero } from "@/components/ui";
import { formatDate } from "@/lib/content";
import { toMediaItems } from "@/lib/media";
import { abs, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";

// Rendered fresh on each visit so new photos and edits show straight away.
export const dynamic = "force-dynamic";

async function load(slug: string) {
  const db = createPublicClient();
  const { data: event } = await db.from("events").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (!event) return null;
  const { data: media } = await db.from("event_media").select("id, kind, path, thumb_path, embed_url, caption").eq("event_id", event.id).order("created_at");
  return { event, items: toMediaItems(media ?? []) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) return { title: "Event" };
  const first = d.items.find((m) => m.kind === "image");
  const text = d.event.summary || `${d.event.title}, ${formatDate(d.event.starts_on)}${d.event.venue ? ` at ${d.event.venue}` : ""}.`;
  return pageMeta({
    title: d.event.title,
    description: text.length > 158 ? `${text.slice(0, 155).trimEnd()}...` : text,
    path: `/events/${d.event.slug}`,
    image: first?.src ?? null,
  });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) notFound();
  const { event, items } = d;
  const past = event.starts_on < new Date().toISOString().slice(0, 10);
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Events", path: "/events" }, { name: event.title, path: `/events/${event.slug}` }]),
          {
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            description: event.summary || undefined,
            startDate: event.starts_on,
            eventStatus: "https://schema.org/EventScheduled",
            location: { "@type": "Place", name: event.venue || "To be confirmed", address: event.address || event.venue || "To be confirmed" },
            organizer: { "@id": abs("/#organization") },
            url: abs(`/events/${event.slug}`),
            image: items.find((m) => m.kind === "image")?.src,
          },
        ]}
      />
      <PageHero title={event.title} body={event.summary || undefined}>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li className="flex items-center gap-2"><CalendarDays className="size-4" />{formatDate(event.starts_on)}</li>
          {event.time_label && <li className="flex items-center gap-2"><Clock className="size-4" />{event.time_label}</li>}
          {event.venue && <li className="flex items-center gap-2"><MapPin className="size-4" />{event.venue}</li>}
        </ul>
      </PageHero>
      <Container className="space-y-10 py-12">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/events" variant="secondary">← All events</ButtonLink>
          {!past && event.register_url && <ButtonLink href={event.register_url} external>Register</ButtonLink>}
          {event.venue && <ButtonLink href={map} variant="secondary" external>Map</ButtonLink>}
        </div>
        {items.length ? (
          <MediaGallery items={items} eventTitle={event.title} />
        ) : (
          <p className="text-muted">{past ? "Photos and videos from this event will be added soon." : <>More details will be added here. <Link href="/events" className="font-medium text-brand">See all events</Link>.</>}</p>
        )}
      </Container>
    </>
  );
}

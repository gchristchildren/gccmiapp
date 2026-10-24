import { JsonLd } from "@/components/JsonLd";
import { abs, breadcrumbSchema, pageMeta } from "@/lib/seo";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { eventCategories, splitEvents, type EventCategory } from "@/lib/content";
import { fetchPublicEvents } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMeta({
  title: "Events, Workshops and Conferences",
  description: "Upcoming GCCMI events: Bible Quiz, Easter, Summer and Christmas events, parenting workshops and the annual international parenting conference.",
  path: "/events",
});

export default async function Events({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = eventCategories.find((c) => c === category) as EventCategory | undefined;

  const all = await fetchPublicEvents();
  const { upcoming, past } = splitEvents(active ? all.filter((e) => e.category === active) : all);

  // Which events has the signed-in visitor registered for? (Signed-out visitors just see "Register".)
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: regs } = auth.user
    ? await supabase.from("event_registrations").select("event_id").eq("profile_id", auth.user.id)
    : { data: [] };
  const registered = new Set((regs ?? []).map((r) => r.event_id));

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition ${on ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:bg-brand-soft"}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Events", path: "/events" }]),
          ...upcoming.map((e) => ({
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.title,
            description: e.summary || undefined,
            startDate: e.date,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
            location: { "@type": "Place", name: e.venue, address: e.address || e.venue },
            organizer: { "@id": abs("/#organization") },
            url: abs("/events"),
            isAccessibleForFree: true,
            offers: { "@type": "Offer", url: e.registerUrl ?? abs("/events"), price: "0", priceCurrency: "GBP", availability: "https://schema.org/InStock" },
          })),
        ]}
      />
      <PageHero title="Events" body="Bible Club, Academy, Masterclass, charity outreach and community events." />
      <Container className="py-12">
        <nav className="flex flex-wrap gap-2" aria-label="Event categories">
          <Link href="/events" className={chip(!active)}>All</Link>
          {eventCategories.map((c) => (
            <Link key={c} href={`/events?category=${encodeURIComponent(c)}`} className={chip(c === active)}>{c}</Link>
          ))}
        </nav>

        <div className="mt-12">
          <SectionHeading title="Upcoming events" />
          {upcoming.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => <EventCard key={e.slug} event={e} registered={registered.has(e.id)} />)}
            </div>
          ) : (
            <p className="mt-6 text-muted">No upcoming events{active ? " in this category" : ""} yet. Check back soon.</p>
          )}
        </div>

        <div className="mt-16">
          <SectionHeading title="Past events" body="Photos, videos and testimonials will appear here." />
          {past.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => <EventCard key={e.slug} event={e} past />)}
            </div>
          ) : (
            <p className="mt-6 text-muted">No past events{active ? " in this category" : ""} yet.</p>
          )}
        </div>
      </Container>
    </>
  );
}

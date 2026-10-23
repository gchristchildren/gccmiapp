import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { eventCategories, pastEvents, upcomingEvents, type EventCategory } from "@/lib/content";

export const metadata = { title: "Events" };
export const revalidate = 3600;

export default async function Events({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = eventCategories.find((c) => c === category) as EventCategory | undefined;
  const match = <T extends { category: EventCategory }>(list: T[]) => (active ? list.filter((e) => e.category === active) : list);
  const upcoming = match(upcomingEvents());
  const past = match(pastEvents());

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition ${on ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:bg-brand-soft"}`;

  return (
    <>
      <PageHero title="Events" body="Bible Club, Academy, Masterclass, charity outreach and community events." />
      <Container className="py-12">
        <nav className="flex flex-wrap gap-2" aria-label="Event categories">
          <Link href="/events" className={chip(!active)}>All</Link>
          {eventCategories.map((c) => (
            <Link key={c} href={`/events?category=${encodeURIComponent(c)}`} className={chip(c === active)}>
              {c}
            </Link>
          ))}
        </nav>

        <div className="mt-12">
          <SectionHeading title="Upcoming events" sample />
          {upcoming.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => <EventCard key={e.slug} event={e} />)}
            </div>
          ) : (
            <p className="mt-6 text-muted">No upcoming events in this category yet.</p>
          )}
        </div>

        <div className="mt-16">
          <SectionHeading title="Past events" body="Photos, videos and testimonials will appear here." />
          {past.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => <EventCard key={e.slug} event={e} past />)}
            </div>
          ) : (
            <p className="mt-6 text-muted">No past events in this category yet.</p>
          )}
        </div>
      </Container>
    </>
  );
}

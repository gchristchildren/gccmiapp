import { ArrowRight, BookOpen, GraduationCap, HandHeart, Heart, Library, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { ButtonLink, Card, Container, SectionHeading } from "@/components/ui";
import {
  SHOW_SAMPLE_BADGES,
  faqs,
  featuredProject,
  formatDate,
  impactStats,
  programmes,
  testimonials,
  upcomingEvents,
  books,
} from "@/lib/content";
import { site } from "@/lib/site";

export const revalidate = 3600;

const quickLinks = [
  { href: "/programmes/bible-club", label: "Register for Bible Club", icon: BookOpen },
  { href: "/programmes/academy", label: "Register for Academy", icon: GraduationCap },
  { href: "/programmes/masterclass", label: "Register for Masterclass", icon: Library },
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/books", label: "Shop Books", icon: ShoppingBag },
];

const programmeIcons = [BookOpen, GraduationCap, Library];

export default function Home() {
  const next = upcomingEvents()[0];

  return (
    <>
      {/* Hero */}
      <section className="hero-bg relative -mt-[68px] overflow-hidden pt-[68px]">
        <Container className="pb-16 pt-14 text-center sm:pb-24 sm:pt-20">
          <p className="mx-auto mb-4 w-fit rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-medium text-muted">
            Welcome to the GCCMI community hub
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Raising children, strengthening families, serving communities
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted sm:text-lg">
            Bible Club for children, the Academy and Masterclass for learning, and charity outreach that makes a
            difference. All in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/programmes/bible-club">Register for Bible Club</ButtonLink>
            <ButtonLink href="/donate" variant="secondary">
              <Heart className="size-4" /> Donate
            </ButtonLink>
          </div>

          {/* Floating cards */}
          <div className="relative mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3 sm:items-center">
            <Card className="float-slow p-4 text-left sm:-rotate-2">
              <p className="text-xs font-medium text-muted">Next event</p>
              <p className="mt-1 font-semibold">{next?.title ?? "Events coming soon"}</p>
              {next && <p className="mt-1 text-sm text-brand">{formatDate(next.date)}</p>}
            </Card>
            <Card className="p-5 text-left">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand">
                  <BookOpen className="size-4" />
                </span>
                Bible Club reminder
              </div>
              <p className="mt-3 rounded-2xl bg-surface-2 p-3 text-sm text-muted">
                🔔 Bible Club starts tomorrow. This week&apos;s memory verse is ready.
              </p>
              <div className="mt-3 rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-brand-fg">
                Open parent portal
              </div>
            </Card>
            <Card className="float-slower p-4 text-left sm:rotate-2">
              <p className="text-xs font-medium text-muted">Community impact</p>
              <p className="mt-1 text-3xl font-bold text-brand">{impactStats[0].value}</p>
              <p className="text-sm text-muted">{impactStats[0].label}</p>
              {SHOW_SAMPLE_BADGES && <p className="mt-2 text-[11px] font-medium text-gold">Sample figure</p>}
            </Card>
          </div>
        </Container>
      </section>

      {/* Quick links */}
      <section className="-mt-6 relative z-10">
        <Container>
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-line bg-surface p-3 shadow-card sm:grid-cols-3 lg:grid-cols-5">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-2xl p-3 text-sm font-semibold transition hover:bg-brand-soft"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand group-hover:bg-surface">
                  <Icon className="size-4" />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Programmes */}
      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Programmes" title="Learn, grow and belong with GCCMI" />
            <ButtonLink href="/about" variant="secondary">
              About GCCMI
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {programmes.map((p, i) => {
              const Icon = programmeIcons[i];
              return (
                <Card key={p.slug} className="flex flex-col">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted">{p.short}</p>
                  <Link
                    href={`/programmes/${p.slug}`}
                    className="mt-5 inline-flex items-center gap-1 pt-1 text-sm font-semibold text-brand"
                  >
                    Learn more <ArrowRight className="size-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Upcoming events */}
      <section className="py-4">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Events" title="Upcoming events" sample />
            <ButtonLink href="/events" variant="secondary">
              All events
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {upcomingEvents()
              .slice(0, 3)
              .map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
          </div>
        </Container>
      </section>

      {/* Featured charity project + impact */}
      <section className="py-20">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="hero-bg rounded-3xl border border-line p-8 sm:p-10">
              <SectionHeading eyebrow="Charity impact" title={featuredProject.title} sample />
              <p className="mt-4 max-w-xl text-muted">{featuredProject.body}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/donate">
                  <HandHeart className="size-4" /> Support this project
                </ButtonLink>
                <ButtonLink href="/charity-impact" variant="secondary">
                  See our impact
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {impactStats.map((s) => (
                <Card key={s.label} className="flex flex-col justify-center">
                  <p className="text-3xl font-bold text-brand">{s.value}</p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Books */}
      <section className="py-4">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Books" title="Books to inspire your family" sample />
            <ButtonLink href="/books" variant="secondary">
              All books
            </ButtonLink>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {books.map((b) => (
              <a
                key={b.title}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-3xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1"
              >
                <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-gradient-to-br from-brand to-emerald-900 p-4 text-center text-sm font-bold text-white">
                  {b.title}
                </div>
                <p className="mt-3 text-sm font-semibold">{b.title}</p>
                <p className="text-sm text-brand">Buy on Amazon →</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Testimonials"
            title="What families are saying"
            body="Trusted by parents, students and volunteers."
            sample
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.quote} className="flex flex-col justify-between">
                <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                    <Users className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-4">
        <Container className="max-w-3xl">
          <SectionHeading align="center" eyebrow="FAQ" title="Frequently asked questions" body="Everything you need to know before getting started." />
          <div className="mt-10 divide-y divide-line rounded-3xl border border-line bg-surface px-6 shadow-card">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="py-20">
        <Container>
          <div className="hero-bg rounded-3xl border border-line px-6 py-14 text-center">
            <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Be part of what God is doing through GCCMI
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/donate">Donate</ButtonLink>
              <ButtonLink href="/volunteer" variant="secondary">
                Volunteer
              </ButtonLink>
              <ButtonLink href={site.mainSite} variant="ghost" external>
                Visit gccmi.co.uk
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

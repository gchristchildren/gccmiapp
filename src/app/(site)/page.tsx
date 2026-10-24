import { ArrowRight, BookOpen, GraduationCap, HandHeart, Heart, Library, ShoppingBag, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { ButtonLink, Card, Container, SectionHeading } from "@/components/ui";
import {
  academySubjectsShort,
  coreValues,
  faqs,
  featuredProject,
  formatDate,
  impactStats,
  programmes,
  testimonials,
  splitEvents,
} from "@/lib/content";
import { fetchPublicEvents } from "@/lib/events";
import { galleryPhotos } from "@/lib/gallery";
import { fetchPosts } from "@/lib/posts";
import { faqSchema, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";

const homeTitle = `${site.name} | Free Online Bible Club for Children, Academy & Masterclass`;
export const metadata: Metadata = {
  ...pageMeta({
    title: homeTitle,
    description:
      "GCC Ministry International runs a free online Bible Club for Christian children worldwide, plus Academy, Masterclass and parenting support, from Edinburgh, UK.",
    path: "/",
  }),
  title: { absolute: homeTitle },
};

// Rendered fresh on each visit so admin edits (posts, events) show immediately.
export const dynamic = "force-dynamic";

const quickLinks: { href: string; label: string; icon: typeof BookOpen; external?: boolean }[] = [
  { href: "/programmes/bible-club", label: "Register for Bible Club", icon: BookOpen },
  { href: "/programmes/academy", label: "Register for Academy", icon: GraduationCap },
  { href: "/programmes/masterclass", label: "Register for Masterclass", icon: Library },
  { href: site.donateUrl, label: "Donate", icon: Heart, external: true },
  { href: "/books", label: "Shop Books", icon: ShoppingBag },
];

const programmeIcons = [BookOpen, GraduationCap, Library];

export default async function Home() {
  const [events, posts] = await Promise.all([fetchPublicEvents(), fetchPosts(3)]);
  const { upcoming } = splitEvents(events);
  const next = upcoming[0];

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      {/* Hero */}
      <section className="hero-bg relative -mt-[68px] overflow-hidden pt-[68px]">
        <Container className="pb-16 pt-14 text-center sm:pb-24 sm:pt-20">
          <p className="mx-auto mb-4 w-fit rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-medium text-muted">
            {site.legalName}
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Welcome to GCC Ministry International
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted sm:text-lg">
            Welcome to {site.legalName}, a citadel of first-class learning, with educative, empowering and inspiring
            programmes and activities for children as well as parents.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Both children and parents have been benefitting from our programmes, especially our annual international
            parenting workshop. We foster a love for learning within a safe, purposeful and nurturing online environment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/about">About Us</ButtonLink>
            <ButtonLink href="/programmes/bible-club" variant="secondary">
              Programmes
            </ButtonLink>
            <ButtonLink href={site.donateUrl} variant="secondary" external>
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
            </Card>
          </div>
        </Container>
      </section>

      {/* Quick links */}
      <section className="-mt-6 relative z-10">
        <Container>
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-line bg-surface p-3 shadow-card sm:grid-cols-3 lg:grid-cols-5">
            {quickLinks.map(({ href, label, icon: Icon, external }) => {
              const cls = "group flex items-center gap-3 rounded-2xl p-3 text-sm font-semibold transition hover:bg-brand-soft";
              const inner = (
                <>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand group-hover:bg-surface">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </>
              );
              return external ? (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <Link key={href} href={href} className={cls}>{inner}</Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* We are GCCMI + core values */}
      <section className="pt-20">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <Card className="p-8 sm:p-10">
              <SectionHeading eyebrow="We are GCCMI" title="A non-profit charitable trust serving children and parents" />
              <p className="mt-4 max-w-xl text-muted">
                We are a non-profit making charitable trust that has successfully grown over the past few years, supported
                by the Joy King Foundation and by some of our parents who believe in us.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={site.donateUrl} external>
                  <HandHeart className="size-4" /> Support us
                </ButtonLink>
                <ButtonLink href="/about" variant="secondary">
                  About us
                </ButtonLink>
              </div>
            </Card>
            <Card className="p-8 sm:p-10">
              <h2 className="text-xl font-bold">Our core values</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {coreValues.map((v) => (
                  <li key={v} className="rounded-full bg-brand-soft px-4 py-1.5 text-sm font-medium text-brand">
                    {v}
                  </li>
                ))}
              </ul>
              <Link href="/about" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Learn more <ArrowRight className="size-4" />
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* Programmes */}
      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Programmes" title="Learn, grow and belong with GCCMI" />
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
                  {p.slug === "academy" && <p className="mt-2 text-xs font-medium text-brand">{academySubjectsShort}</p>}
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

      {/* Why parents choose us */}
      <section className="pb-4">
        <Container>
          <div className="hero-bg flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-line px-8 py-10 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why parents choose us</h2>
              <p className="mt-3 text-muted">
                Our primary assignment is to teach Christian children the Word of God and to empower them to be relevant in
                every area of life.
              </p>
            </div>
            <ButtonLink href="/programmes/bible-club">Enroll your child</ButtonLink>
          </div>
        </Container>
      </section>

      {/* Upcoming events */}
      <section className="py-4">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Events" title="Upcoming events" />
            <ButtonLink href="/events" variant="secondary">
              All events
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {upcoming.slice(0, 3).map((e) => (
              <EventCard key={e.slug} event={e} compact />
            ))}
            {!upcoming.length && <p className="text-muted md:col-span-3">New events will be announced here soon.</p>}
          </div>
        </Container>
      </section>

      {/* Gallery preview */}
      <section className="pt-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Gallery" title="Moments from GCCMI" />
            <ButtonLink href="/gallery" variant="secondary">
              See the gallery
            </ButtonLink>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {galleryPhotos.slice(0, 6).map((ph, i) => (
              <Link key={ph.src} href="/gallery" className="group relative block aspect-square overflow-hidden rounded-2xl border border-line">
                <Image src={ph.src} alt="GCCMI Bible Club and community event photo" fill sizes="(min-width:1024px) 16vw, (min-width:640px) 33vw, 50vw" className="object-cover transition duration-300 group-hover:scale-105" priority={i < 2} />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* From the blog */}
      {!!posts.length && (
        <section className="pt-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="News & blog" title="From our blog" />
              <ButtonLink href="/blog" variant="secondary">
                All posts
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition hover:-translate-y-1">
                  {post.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_url} alt={post.title} className="aspect-video w-full object-cover" loading="lazy" />
                  )}
                  <div className="p-5">
                    <p className="text-xs text-muted">{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })}</p>
                    <h3 className="mt-1 font-bold">{post.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted [overflow-wrap:anywhere]">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Featured charity project + impact */}
      <section className="py-20">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="hero-bg rounded-3xl border border-line p-8 sm:p-10">
              <SectionHeading eyebrow="Charity impact" title={featuredProject.title} sample />
              <p className="mt-4 max-w-xl text-muted">{featuredProject.body}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={site.donateUrl} external>
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
            <SectionHeading eyebrow="Books" title="Bible lessons for your children" />
            <ButtonLink href="/books" variant="secondary">
              Books &amp; store
            </ButtonLink>
          </div>
          <Card className="mt-10 flex flex-wrap items-center justify-between gap-5">
            <p className="max-w-xl text-muted">
              Our children&apos;s books are available on Amazon. You can buy them securely there, and browse more in our store.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={site.amazonBooks} external>
                Buy on Amazon
              </ButtonLink>
              <ButtonLink href={site.store} variant="secondary" external>
                Visit our store
              </ButtonLink>
            </div>
          </Card>
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
              <ButtonLink href={site.donateUrl} external>Donate</ButtonLink>
              <ButtonLink href="/volunteer" variant="secondary">
                Volunteer
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact us
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

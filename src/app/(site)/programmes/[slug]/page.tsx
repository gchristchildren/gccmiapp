import { Check } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { notFound } from "next/navigation";
import { ButtonLink, Card, Container, PageHero } from "@/components/ui";
import { programmes } from "@/lib/content";
import { breadcrumbSchema, courseSchema, faqSchema, pageMeta } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 300;

export function generateStaticParams() {
  return programmes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = programmes.find((x) => x.slug === slug);
  if (!p) return { title: "Programme" };
  return pageMeta({ title: p.metaTitle, description: p.metaDescription, path: `/programmes/${p.slug}` });
}

export default async function Programme({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = programmes.find((x) => x.slug === slug);
  if (!p) notFound();

  // Masterclass shows its published courses and schedules (lessons themselves are members-only).
  const { data: courses } = p.slug === "masterclass"
    ? await createPublicClient().from("courses").select("id, title, description, schedule_note").eq("published", true).order("created_at")
    : { data: null };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Programmes", path: "/programmes/bible-club" }, { name: p.name, path: `/programmes/${p.slug}` }]),
          courseSchema(p),
          faqSchema(p.faqs),
        ]}
      />
      <PageHero title={`GCCMI ${p.name}`} body={p.short}>
        <div className="mt-6 flex flex-wrap gap-2">
          {programmes.map((x) => (
            <ButtonLink key={x.slug} href={`/programmes/${x.slug}`} variant={x.slug === p.slug ? "primary" : "secondary"}>
              {x.name}
            </ButtonLink>
          ))}
        </div>
      </PageHero>
      <Container className="grid gap-6 py-16 md:grid-cols-[1.3fr_1fr]">
        <Card>
          <h2 className="text-xl font-bold">What&apos;s included</h2>
          <ul className="mt-4 space-y-3">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                {h}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="bg-brand-soft">
          <h2 className="text-xl font-bold">How to register</h2>
          <p className="mt-3 text-sm text-muted">{p.registration}</p>
          <p className="mt-3 text-sm text-muted">
            {p.slug === "academy"
              ? "Already a student? Sign in to the Learning Hub for previous classes, resources and weekly assignments."
              : "Register in the parent portal, or see upcoming events for dates."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={p.slug === "masterclass" ? "/portal/masterclass" : "/portal"}>{p.slug === "masterclass" ? "Register in the portal" : "Parent portal"}</ButtonLink>
            <ButtonLink href="/events" variant="secondary">
              Upcoming events
            </ButtonLink>
            <ButtonLink href="/instructors" variant="secondary">
              Our instructors
            </ButtonLink>
          </div>
        </Card>
        {!!p.sections?.length && (
          <div className="grid gap-6 md:col-span-2 md:grid-cols-2">
            {p.sections.map((sec) => (
              <Card key={sec.title}>
                <h2 className="text-xl font-bold">{sec.title}</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {sec.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-line rounded-3xl border border-line bg-surface px-6 shadow-card">
            {p.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        {!!courses?.length && (
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-bold">Courses</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((c) => (
                <Card key={c.id}>
                  <h3 className="font-bold">{c.title}</h3>
                  {c.schedule_note && <p className="text-xs font-medium text-brand">{c.schedule_note}</p>}
                  <p className="mt-2 text-sm text-muted">{c.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

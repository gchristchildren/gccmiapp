import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { ButtonLink, Card, Container, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";
import { impactAreas, impactStats, SHOW_SAMPLE_BADGES } from "@/lib/content";

export const metadata = pageMeta({
  title: "Charity Impact and Outreach",
  description: "See how GCC Ministry International serves families through community projects, school support, food donations, outreach programmes and volunteering.",
  path: "/charity-impact",
});

export default function CharityImpact() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Charity impact", path: "/charity-impact" }])} />
      <PageHero
        title="See the difference your support makes"
        body="Community projects, school support, food donations, outreach and volunteering."
      >
        <div className="mt-6 flex gap-3">
          <ButtonLink href={site.donateUrl} external>Donate</ButtonLink>
          <ButtonLink href="/volunteer" variant="secondary">Volunteer</ButtonLink>
        </div>
      </PageHero>
      <Container className="space-y-20 py-16">
        <section>
          <SectionHeading title="GCCMI at a glance" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {impactStats.map((s) => (
              <Card key={s.label}>
                <p className="text-3xl font-bold text-brand">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <SectionHeading title="Where we serve" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {impactAreas.map((a) => (
              <Card key={a.title}>
                <div className="mb-4 aspect-video rounded-2xl bg-brand-soft" />
                <h3 className="font-bold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted">{a.body}</p>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <SectionHeading title="Success stories" sample />
          <Card className="mt-8">
            <p className="text-muted">
              {SHOW_SAMPLE_BADGES ? "Sample: " : ""}A real story from a family or community helped by GCCMI, with photos or
              video, will appear here.
            </p>
          </Card>
        </section>
      </Container>
    </>
  );
}

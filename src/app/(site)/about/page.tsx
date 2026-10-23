import { ButtonLink, Card, Container, PageHero, SectionHeading } from "@/components/ui";
import { impactStats, SHOW_SAMPLE_BADGES } from "@/lib/content";

export const metadata = { title: "About GCCMI" };

// TODO(owner): replace placeholder copy with the story, mission, vision and leadership from gccmi.co.uk.
export default function About() {
  return (
    <>
      <PageHero
        title="About GCC Ministry International"
        body="Our story, our mission and the people behind GCCMI."
      />
      <Container className="space-y-20 py-16">
        {SHOW_SAMPLE_BADGES && (
          <p className="rounded-2xl bg-gold-soft px-4 py-3 text-sm text-gold">
            Placeholder copy. The final text will come from gccmi.co.uk.
          </p>
        )}
        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who we are" title="Our story" />
            <p className="mt-4 text-muted">
              GCC Ministry International (GCCMI) is a UK-based ministry serving children, families and communities
              through Bible Club, the Academy, Masterclass and charity outreach. Replace this paragraph with the
              founding story.
            </p>
          </div>
          <div className="grid gap-4">
            <Card>
              <h3 className="font-bold">Mission</h3>
              <p className="mt-2 text-sm text-muted">Mission statement to be added.</p>
            </Card>
            <Card>
              <h3 className="font-bold">Vision</h3>
              <p className="mt-2 text-sm text-muted">Vision statement to be added.</p>
            </Card>
          </div>
        </section>
        <section>
          <SectionHeading eyebrow="Leadership" title="Founder and leadership" />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {["Founder", "Leader", "Leader"].map((role, i) => (
              <Card key={i}>
                <div className="aspect-square rounded-2xl bg-brand-soft" />
                <p className="mt-4 font-semibold">Name to be added</p>
                <p className="text-sm text-muted">{role}</p>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <SectionHeading eyebrow="Impact" title="Impact and achievements" />
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
          <SectionHeading eyebrow="Gallery" title="Photos and videos" body="Photo and video galleries will be added here." />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-3xl border border-line bg-brand-soft" />
            ))}
          </div>
        </section>
        <ButtonLink href="/volunteer">Get involved</ButtonLink>
      </Container>
    </>
  );
}

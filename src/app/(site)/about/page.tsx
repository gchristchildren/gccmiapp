import { ButtonLink, Card, Container, PageHero, SectionHeading } from "@/components/ui";
import { impactStats } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata = { title: "About GCCMI" };

const values = ["Excellence", "Integrity", "Social Responsibility", "Trustworthiness", "Commitment", "Passion"];

export default function About() {
  return (
    <>
      <PageHero title={`About ${site.legalName}`} body="Our story, our vision and the values we hold." />
      <Container className="space-y-20 py-16">
        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who we are" title="Our story" />
            <div className="mt-4 space-y-4 text-muted">
              <p>
                We are {site.legalName}. We reach out to children near and far to support them with learning facilities
                through programmes such as our free Online Bible Club (since 2016) and Academy for Kids.
              </p>
              <p>
                We understand that ministering to children means ministering to their families, especially their parents.
                So we have put in place programmes to support parents too, including our free annual Parenting Conference,
                chat shows and three-minute talks with parents.
              </p>
              <p>
                We are a non-profit charitable trust that has grown over the past few years, supported by the Joy King
                Foundation and by parents who believe in us.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={site.donateUrl} external>Support us</ButtonLink>
              <ButtonLink href="/programmes/bible-club" variant="secondary">
                Join Bible Club
              </ButtonLink>
              <ButtonLink href="/instructors" variant="secondary">
                Meet our instructors
              </ButtonLink>
              <ButtonLink href="/gallery" variant="secondary">
                Gallery
              </ButtonLink>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            <iframe
              src={site.aboutVideo}
              title="About GCCMI"
              className="aspect-video w-full"
              allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card>
            <h2 className="font-bold">Vision</h2>
            <p className="mt-2 text-muted">
              To empower Christian children with necessary information that will be relevant to their life journey.
            </p>
          </Card>
          <Card>
            <h2 className="font-bold">Why parents choose us</h2>
            <p className="mt-2 text-muted">
              Our primary assignment is to teach Christian children the Word of God and to empower them to be relevant in
              every area of life.
            </p>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Core values" title="What we stand for" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {values.map((v) => (
              <Card key={v} className="p-5 text-center font-semibold">
                {v}
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="At a glance" title="GCCMI at a glance" />
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
          <SectionHeading eyebrow="Follow us" title="Photos, videos and updates" body="See what's happening across GCCMI on our social channels." />
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={site.social.youtube} variant="secondary" external>YouTube</ButtonLink>
            <ButtonLink href={site.social.instagram} variant="secondary" external>Instagram</ButtonLink>
            <ButtonLink href={site.social.facebook} variant="secondary" external>Facebook group</ButtonLink>
          </div>
        </section>
      </Container>
    </>
  );
}

import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import Image from "next/image";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { instructorGroups } from "@/lib/instructors";

export const metadata = pageMeta({
  title: "Our Instructors and Team",
  description: "Meet the Bible Club teachers, Academy instructors and team members who teach children and support families at GCC Ministry International.",
  path: "/instructors",
});

export default function Instructors() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Instructors", path: "/instructors" }])} />
      <PageHero title="Our instructors" body="The teachers, leaders and mentors behind our Academy, Bible Club and Masterclass." />
      <Container className="space-y-16 py-14">
        {instructorGroups.map((g, gi) => (
          <section key={g.group}>
            <SectionHeading eyebrow={`${g.items.length} ${g.items.length === 1 ? "person" : "people"}`} title={g.group} />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {g.items.map((it, i) => (
                <figure key={it.src} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
                  <div className="relative aspect-[4/5] bg-brand-soft">
                    <Image
                      src={it.src}
                      alt={`${g.group}: ${it.label}`}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                      className="object-cover object-top"
                      loading={gi === 0 && i < 4 ? "eager" : "lazy"}
                    />
                  </div>
                  <figcaption className="p-3 text-center">
                    <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">{it.label}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}

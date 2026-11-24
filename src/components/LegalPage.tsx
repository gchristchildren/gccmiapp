import { Container, PageHero } from "@/components/ui";

export type LegalSection = { title: string; body: (string | string[])[] };

/** Plain long-form page for the privacy policy and terms: numbered headings, paragraphs and bullet lists. */
export function LegalPage({ title, intro, updated, sections }: { title: string; intro: string; updated: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero title={title} body={intro} />
      <Container className="max-w-3xl space-y-10 py-14">
        <p className="text-sm text-muted">Last updated {updated}</p>
        {sections.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-xl font-bold">{i + 1}. {s.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted">
              {s.body.map((b, j) =>
                Array.isArray(b) ? (
                  <ul key={j} className="list-disc space-y-1.5 pl-6">{b.map((li) => <li key={li}>{li}</li>)}</ul>
                ) : (
                  <p key={j}>{b}</p>
                ),
              )}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}

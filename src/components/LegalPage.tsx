import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Inline } from "@/components/RichText";
import { Container, PageHero } from "@/components/ui";
import { policyMeta, type Block, type PolicySection } from "@/lib/policies";
import { breadcrumbSchema } from "@/lib/seo";

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mt-3 space-y-3 leading-relaxed text-muted">
      {blocks.map((b, i) => {
        if (typeof b === "string") return <p key={i}><Inline text={b} /></p>;
        if (Array.isArray(b)) {
          return <ul key={i} className="list-disc space-y-1.5 pl-6">{b.map((li) => <li key={li}><Inline text={li} /></li>)}</ul>;
        }
        if ("h" in b) return <h3 key={i} className="pt-2 font-bold text-fg">{b.h}</h3>;
        return (
          <div key={i} className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-surface-2 text-fg">
                <tr>{b.table.head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {b.table.rows.map((r) => (
                  <tr key={r[0]}>{r.map((c, j) => <td key={j} className={`px-4 py-3 align-top ${j === 0 ? "font-medium text-fg" : ""}`}><Inline text={c} /></td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

/** Numbered sections, each with an anchor so other pages can link straight to it. */
export function PolicySections({ sections }: { sections: PolicySection[] }) {
  return (
    <>
      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className="scroll-mt-28">
          <h2 className="text-xl font-bold">{i + 1}. {s.title}</h2>
          <Blocks blocks={s.blocks} />
        </section>
      ))}
    </>
  );
}

export function LegalPage({ title, intro, path, sections, showMeta = true }: { title: string; intro: string; path: string; sections: PolicySection[]; showMeta?: boolean }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: title, path }])} />
      <PageHero title={title} body={intro} />
      <Container className="max-w-3xl space-y-10 py-14">
        {showMeta && (
          <p className="text-sm text-muted">
            Version {policyMeta.version} · Effective {policyMeta.effective} · Approved by the Trustees on {policyMeta.approved}. Part of our{" "}
            <Link href="/policies" className="font-medium text-brand">website policies</Link>.
          </p>
        )}
        <PolicySections sections={sections} />
      </Container>
    </>
  );
}

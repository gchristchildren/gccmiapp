import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { PolicySections } from "@/components/LegalPage";
import { Card, Container, PageHero } from "@/components/ui";
import { mainPolicies, otherPolicies, policyMeta } from "@/lib/policies";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Website Policies",
  description: "All GCC Ministry International policies in one place: privacy, cookies, terms, safeguarding, online class rules, photos, donations, fees, volunteers and more.",
  path: "/policies",
});

export default function Policies() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Website Policies", path: "/policies" }])} />
      <PageHero title="Website policies" body="How we keep children safe, look after your information and run our programmes." />
      <Container className="max-w-4xl space-y-14 py-14">
        <section>
          <h2 className="text-xl font-bold">About these policies</h2>
          <div className="mt-3 space-y-3 leading-relaxed text-muted">
            <p>
              GCCMI is a non-profit that runs a free online Bible Club for children (live on Zoom every Friday and Saturday UK time), the GCC
              Academy for children, the Masterclass for adults, an annual international parenting conference, events, volunteering
              opportunities and a book store.
            </p>
            <p>
              These policies apply to everyone who uses our website, parent portal or programmes: parents and carers, children, adult
              learners, donors, volunteers, instructors, staff, trustees and visitors. Where a policy is only for some people, it says so. If
              two policies conflict, the Safeguarding Policy takes priority.
            </p>
            <p className="text-sm">
              Version {policyMeta.version} · Effective {policyMeta.effective} · Approved by the Trustees on {policyMeta.approved} · Reviewed {policyMeta.review}.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">Key policies</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {mainPolicies.map((p) => (
              <Link key={p.path} href={p.path} className="group">
                <Card className="h-full transition group-hover:-translate-y-0.5">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted">{p.short}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">Read <ArrowRight className="size-4" /></span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">Other policies</h2>
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            {otherPolicies.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="font-medium text-brand">{s.title}</a></li>
            ))}
          </ul>
        </section>

        <div className="space-y-10 border-t border-line pt-10">
          <PolicySections sections={otherPolicies} />
        </div>
      </Container>
    </>
  );
}

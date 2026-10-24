import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { DonateForm } from "@/components/DonateForm";
import { Container, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Donate to Support Children and Families",
  description: "Support free Bible Club classes, community outreach and family programmes for children worldwide with a secure donation to GCC Ministry International.",
  path: "/donate",
});

export default function Donate() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Donate", path: "/donate" }])} />
      <PageHero
        title="Give to GCCMI"
        body="Your gift supports community projects, school support, food donations and outreach."
      />
      <Container className="py-12">
        <DonateForm paypalUrl={site.paypalUrl} justGivingUrl={site.justGivingUrl} />
      </Container>
    </>
  );
}

import { DonateForm } from "@/components/DonateForm";
import { Container, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata = { title: "Donate" };

export default function Donate() {
  return (
    <>
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

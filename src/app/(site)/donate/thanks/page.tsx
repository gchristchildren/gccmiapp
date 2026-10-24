import { noIndex } from "@/lib/seo";
import { ButtonLink, Container, PageHero } from "@/components/ui";

export const metadata = { title: "Thank you", ...noIndex };

export default function Thanks() {
  return (
    <>
      <PageHero title="Thank you for your generosity" body="Your gift has been received. A receipt is on its way to your email." />
      <Container className="py-12">
        <ButtonLink href="/">Back to home</ButtonLink>
      </Container>
    </>
  );
}

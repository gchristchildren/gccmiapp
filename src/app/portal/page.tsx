import { ButtonLink, Container, PageHero } from "@/components/ui";

export const metadata = { title: "Parent portal" };

export default function Portal() {
  return (
    <>
      <PageHero
        title="Parent portal"
        body="Register your children, see the weekly schedule, get reminders and download consent forms. Sign-in opens soon."
      />
      <Container className="py-12">
        <ButtonLink href="/">Back to home</ButtonLink>
      </Container>
    </>
  );
}

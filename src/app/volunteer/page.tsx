import { VolunteerForm } from "@/components/VolunteerForm";
import { Container, PageHero } from "@/components/ui";

export const metadata = { title: "Volunteer" };

export default function Volunteer() {
  return (
    <>
      <PageHero
        title="Volunteer with GCCMI"
        body="Share your skills, hear about opportunities and sign up to help at events."
      />
      <Container className="py-12">
        <VolunteerForm />
      </Container>
    </>
  );
}

import Link from "next/link";
import { VolunteerForm } from "@/components/VolunteerForm";
import { Card, Container, PageHero, SectionHeading } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata = { title: "Volunteer" };
export const revalidate = 300;

export default async function Volunteer() {
  const { data: opps } = await createPublicClient().from("volunteer_opportunities").select("*").eq("published", true).order("starts_on", { nullsFirst: false });

  return (
    <>
      <PageHero
        title="Volunteer with GCCMI"
        body="Share your skills, hear about opportunities and sign up to help at events."
      />
      <Container className="space-y-14 py-12">
        {!!opps?.length && (
          <section>
            <SectionHeading title="Open opportunities" body="Have an account? Sign in to your portal to sign up for a role in one tap." />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {opps.map((o) => (
                <Card key={o.id} className="p-5 text-sm">
                  <p className="text-base font-bold">{o.title}</p>
                  {o.starts_on && <p className="text-xs text-muted">{fmtDate(o.starts_on)}</p>}
                  {o.description && <p className="mt-2 text-muted">{o.description}</p>}
                  {!!o.skills.length && <p className="mt-2 text-xs text-muted">Skills: {o.skills.join(", ")}</p>}
                </Card>
              ))}
            </div>
            <Link href="/portal/volunteering" className="mt-4 inline-block text-sm font-semibold text-brand">Sign in to sign up →</Link>
          </section>
        )}
        <section>
          <h2 className="mx-auto mb-6 max-w-2xl text-center text-2xl font-bold">Register your interest</h2>
          <VolunteerForm />
        </section>
      </Container>
    </>
  );
}

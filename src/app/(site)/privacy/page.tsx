import { JsonLd } from "@/components/JsonLd";
import { LegalPage } from "@/components/LegalPage";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description: "How GCC Ministry International collects, uses and protects the personal information of parents, children, volunteers and donors, under UK GDPR.",
  path: "/privacy",
});

const { email } = site.contact;

export default function Privacy() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Privacy Policy", path: "/privacy" }])} />
      <LegalPage
        title="Privacy Policy"
        intro="What we collect, why, who can see it and how long we keep it."
        updated="24 November 2026"
        sections={[
          {
            title: "Who we are",
            body: [
              `${site.legalName} ("GCCMI", "we", "us") is the organisation responsible for your personal information. We are based at ${site.contact.address.join(", ")}.`,
              `Questions about this policy or your information: ${email}.`,
            ],
          },
          {
            title: "What we collect",
            body: [
              "When you create a parent account, register a child, or use our website, we may collect:",
              [
                "Parent details: name, email address, phone number and password (stored securely, never in readable form).",
                "Child details you give us: first and last name, date of birth, age group, any medical or care notes you choose to share, and whether you consent to photographs.",
                "Activity in the portal: class attendance, consent forms signed, event registrations, Masterclass progress and certificates, and notification preferences.",
                "Volunteer sign-ups: name, email, phone, skills and your message.",
                "Messages you send through the Contact form: name, email and message.",
                "Donation records: amount, date and the name and email given at payment. Card and PayPal details are handled by Stripe and PayPal and are never stored by us.",
                "Basic technical data such as your device and pages visited, used to keep the site secure and working.",
              ],
              "Children's information is provided by their parent or guardian. We do not ask children to create accounts or contact us directly.",
            ],
          },
          {
            title: "Why we use it, and our lawful basis",
            body: [
              [
                "To run Bible Club, Academy and Masterclass and to register children and adults (contract or legitimate interests).",
                "To send class reminders, announcements and service messages you've asked for (consent, or legitimate interests for essential service messages).",
                "To send news and updates by email, only if you tick the box to receive them (consent). You can withdraw at any time.",
                "To look after children safely, including medical notes and photo consent (consent, and our safeguarding duties).",
                "To process and record donations, and to meet charity and tax record-keeping rules (legal obligation).",
                "To answer messages, manage volunteers and keep the website secure (legitimate interests).",
              ],
            ],
          },
          {
            title: "Who can see your information",
            body: [
              "Parents see only their own family's records. Authorised GCCMI team members and administrators can see the information they need to run the programmes. We never sell your information or use it for third-party advertising.",
              "We use trusted providers to run the service, who handle information only on our instructions:",
              [
                "Supabase: database and sign-in (hosted in the UK/Europe).",
                "Vercel: website hosting.",
                "Stripe and PayPal: payment processing.",
                "Zoom: delivery of live online classes (join links are shared with registered families).",
                "Email and notification services used to send reminders and replies.",
              ],
              "Some providers may process information outside the UK. Where they do, appropriate safeguards are in place, such as approved contractual terms.",
            ],
          },
          {
            title: "Photographs and video",
            body: ["We only use photographs or video of children where a parent or guardian has given photo consent. You can withdraw consent at any time by contacting us, and we will stop using the images going forward."],
          },
          {
            title: "How long we keep it",
            body: [
              [
                "Account and child records: while your account is active, and for up to 12 months after you close it or stop taking part.",
                "Volunteer sign-ups and contact messages: up to 24 months.",
                "Donation and Gift Aid records: for as long as the law requires for charity accounts and tax, normally six years.",
                "Safeguarding records: for the period set out in our safeguarding policy.",
              ],
              "You can ask us to delete your account at any time.",
            ],
          },
          {
            title: "Your rights",
            body: [
              "Under UK data protection law you can ask to see the information we hold about you, correct it, have it deleted, restrict or object to how we use it, receive a copy of it in a portable format, and withdraw consent. Contact us at " + email + " and we will respond within one month.",
              "If you are unhappy with how we have used your information, you have the right to complain to the Information Commissioner's Office (ico.org.uk, 0303 123 1113).",
            ],
          },
          {
            title: "Cookies and similar technology",
            body: [
              "We use only the cookies and storage needed to keep you signed in, remember your light or dark setting and make the installable app work offline. We do not use advertising or tracking cookies.",
            ],
          },
          {
            title: "Changes to this policy",
            body: ["If we change how we use your information we will update this page and the date above. If the change is significant we will tell registered parents."],
          },
        ]}
      />
    </>
  );
}

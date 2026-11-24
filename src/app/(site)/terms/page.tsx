import { JsonLd } from "@/components/JsonLd";
import { LegalPage } from "@/components/LegalPage";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms of Use",
  description: "The terms for using the GCC Ministry International website, parent portal, online classes and donations.",
  path: "/terms",
});

export default function Terms() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Terms of Use", path: "/terms" }])} />
      <LegalPage
        title="Terms of Use"
        intro="The simple rules for using our website, parent portal and online classes."
        updated="24 November 2026"
        sections={[
          {
            title: "About these terms",
            body: [`These terms apply to your use of this website and the parent portal run by ${site.legalName} ("GCCMI"). By using them you agree to these terms. If you do not agree, please do not use them. Please also read our Privacy Policy.`],
          },
          {
            title: "Your account",
            body: [
              [
                "Accounts are for parents and guardians (aged 18 or over). Children's information must be provided by their parent or guardian.",
                "Give accurate information and keep your password private. You are responsible for activity under your account.",
                "Tell us straight away if you think someone else has accessed your account.",
              ],
            ],
          },
          {
            title: "Online classes and programmes",
            body: [
              "Bible Club is free for Christian children worldwide. Academy and Masterclass may have fees, which we will tell you about before you register. Class links are for registered families only and must not be shared publicly.",
              "Please supervise young children while they are online, and help them follow our guidelines: be respectful, keep cameras and chat appropriate, and follow the teacher's directions. We may remove anyone from a class whose behaviour puts others at risk.",
            ],
          },
          {
            title: "Donations",
            body: [
              "Donations are voluntary and are processed securely by PayPal or Stripe. They support our programmes and outreach, and we use them for our charitable purposes. Please contact us if you believe a payment was made in error.",
            ],
          },
          {
            title: "Our content",
            body: [
              "The text, logo, images and teaching materials on this site belong to GCCMI or are used with permission. You may use them for personal, non-commercial and church or family use. Please do not copy or republish them for other purposes without asking us first.",
            ],
          },
          {
            title: "Acceptable use",
            body: [[
              "Do not misuse the site: no attempts to break, overload or gain unauthorised access to it.",
              "Do not submit false, abusive or unlawful content through our forms.",
            ]],
          },
          {
            title: "Our responsibility",
            body: [
              "We take care to keep the site accurate and available, but we cannot promise it will always be uninterrupted or error-free. Links to other websites are provided for convenience and we are not responsible for their content. Nothing in these terms limits liability that cannot be limited by law.",
            ],
          },
          {
            title: "Changes and governing law",
            body: [
              "We may update these terms from time to time. The date at the top shows the latest version. These terms are governed by the laws of Scotland, and the Scottish courts have jurisdiction over any dispute.",
              `Questions? Contact us at ${site.contact.email}.`,
            ],
          },
        ]}
      />
    </>
  );
}

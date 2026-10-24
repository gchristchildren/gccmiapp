import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { organizationSchema, websiteSchema } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema]} />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

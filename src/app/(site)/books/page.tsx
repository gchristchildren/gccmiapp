import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { ShoppingBag, BookOpen } from "lucide-react";
import { ButtonLink, Card, Container, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Christian Parenting Books and Store",
  description: "Books and resources from GCC Ministry International to support Christian parenting, children’s faith and family life, available to buy online.",
  path: "/books",
});

export default function Books() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Books and store", path: "/books" }])} />
      <PageHero
        title="Books & store"
        body="Bible lessons for your children. Our books are on Amazon, and more is available in our store."
      />
      <Container className="grid gap-6 py-16 md:grid-cols-2">
        <Card className="flex flex-col">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
            <BookOpen className="size-5" />
          </span>
          <h2 className="mt-4 text-xl font-bold">Our children&apos;s books on Amazon</h2>
          <p className="mt-2 flex-1 text-sm text-muted">
            Bible lessons for your children. Buying on Amazon is quick and secure, and we never handle your payment.
          </p>
          <div className="mt-5">
            <ButtonLink href={site.amazonBooks} external>
              Buy on Amazon
            </ButtonLink>
          </div>
        </Card>
        <Card className="flex flex-col">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
            <ShoppingBag className="size-5" />
          </span>
          <h2 className="mt-4 text-xl font-bold">GCCMI store</h2>
          <p className="mt-2 flex-1 text-sm text-muted">Browse more resources and products from GCCMI in our online store.</p>
          <div className="mt-5">
            <ButtonLink href={site.store} variant="secondary" external>
              Visit our store
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </>
  );
}

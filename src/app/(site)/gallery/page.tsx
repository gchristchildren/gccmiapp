import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { GalleryGrid } from "@/components/GalleryGrid";
import { Container, PageHero } from "@/components/ui";
import { galleryPhotos } from "@/lib/gallery";

export const metadata = pageMeta({
  title: "Photo Gallery: Bible Club, Events and Outreach",
  description: "Browse photos from GCCMI Bible Club sessions, Academy classes, seasonal events, charity outreach and community activities in Edinburgh and online.",
  path: "/gallery",
});

export default function Gallery() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Gallery", path: "/gallery" }])} />
      <PageHero title="Gallery" body="Moments from GCCMI events, Bible Club and outreach." />
      <Container className="py-12">
        <GalleryGrid photos={galleryPhotos} />
      </Container>
    </>
  );
}

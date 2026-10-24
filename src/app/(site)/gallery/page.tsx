import { GalleryGrid } from "@/components/GalleryGrid";
import { Container, PageHero } from "@/components/ui";
import { galleryPhotos } from "@/lib/gallery";

export const metadata = { title: "Gallery" };

export default function Gallery() {
  return (
    <>
      <PageHero title="Gallery" body="Moments from GCCMI events, Bible Club and outreach." />
      <Container className="py-12">
        <GalleryGrid photos={galleryPhotos} />
      </Container>
    </>
  );
}

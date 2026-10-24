import type { Metadata } from "next";
import type { programmes } from "@/lib/content";
import { site } from "@/lib/site";

export const ogImage = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: `${site.fullName}: free online Bible Club, Academy and Masterclass`,
};

export const abs = (path = "/") => new URL(path, site.url).toString();

type Meta = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
};

/** One call per page: title, description, canonical, Open Graph and Twitter cards. */
export function pageMeta({ title, description, path, image, type = "website", publishedTime, noindex }: Meta): Metadata {
  const images = image ? [{ url: image, alt: title }] : [ogImage];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.fullName,
      locale: "en_GB",
      type,
      ...(publishedTime ? { publishedTime } : {}),
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Private and utility pages: kept out of search results. */
export const noIndex = { robots: { index: false, follow: false } } satisfies Metadata;

const address = {
  "@type": "PostalAddress",
  streetAddress: site.contact.address[0],
  addressLocality: "Edinburgh",
  postalCode: "EH11 3AL",
  addressCountry: "GB",
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "@id": abs("/#organization"),
  name: site.fullName,
  legalName: site.legalName,
  alternateName: site.name,
  description: site.description,
  url: abs("/"),
  logo: { "@type": "ImageObject", url: abs("/brand/gccmi-logo.png") },
  image: abs(ogImage.url),
  foundingDate: "2016",
  slogan: site.tagline,
  email: site.contact.email,
  telephone: site.contact.phone,
  address,
  areaServed: ["GB", "Worldwide"],
  knowsAbout: ["Bible teaching for children", "Christian parenting", "Online learning", "Charity outreach"],
  sameAs: [site.social.facebook, site.social.instagram, site.social.youtube, site.mainSite],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.contact.email,
      telephone: site.contact.phone,
      areaServed: "Worldwide",
      availableLanguage: "English",
    },
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": abs("/#website"),
  url: abs("/"),
  name: site.fullName,
  description: site.description,
  inLanguage: "en-GB",
  publisher: { "@id": abs("/#organization") },
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function faqSchema(list: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Course markup for a programme (Bible Club, Academy, Masterclass). */
export function courseSchema(p: (typeof programmes)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `GCCMI ${p.name}`,
    description: p.short,
    url: abs(`/programmes/${p.slug}`),
    provider: { "@id": abs("/#organization") },
    inLanguage: "en-GB",
    educationalLevel: p.slug === "masterclass" ? "Adult" : "Children",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: p.slug === "bible-club" ? "PT1H" : undefined,
      ...(p.slug === "bible-club"
        ? { courseSchedule: { "@type": "Schedule", repeatFrequency: "P1W", byDay: ["Friday", "Saturday"] } }
        : {}),
    },
    ...(p.slug === "bible-club"
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "GBP", category: "Free" } }
      : {}),
  };
}

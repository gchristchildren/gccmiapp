export const site = {
  name: "GCCMI",
  fullName: "GCC Ministry International",
  tagline: "Raising children, strengthening families, serving communities.",
  description:
    "GCC Ministry International: Bible Club, Academy, Masterclass and charity outreach for children, families and communities.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  mainSite: "https://gccmi.co.uk",
  // TODO(owner): add the registered charity number and safeguarding policy link.
  charityNumber: null as string | null,
  paypalUrl: process.env.NEXT_PUBLIC_PAYPAL_URL ?? null,
  justGivingUrl: process.env.NEXT_PUBLIC_JUSTGIVING_URL ?? null,
};

export const nav = [
  { href: "/about", label: "About" },
  { href: "/programmes/bible-club", label: "Programmes" },
  { href: "/events", label: "Events" },
  { href: "/charity-impact", label: "Impact" },
  { href: "/books", label: "Books" },
  { href: "/volunteer", label: "Volunteer" },
];

export const site = {
  name: "GCCMI",
  fullName: "GCC Ministry International",
  legalName: "Glorious Christian Children Ministry International",
  tagline: "Raising children, strengthening families, serving communities.",
  description:
    "GCC Ministry International: free online Bible Club, Academy, Masterclass and charity outreach for children, families and communities.",
  // Set NEXT_PUBLIC_SITE_URL once a custom domain is live; until then Vercel's production host is used.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://gccmiapp.vercel.app"
        : "http://localhost:3000"),
  mainSite: "https://gccmi.co.uk",
  // TODO(owner): add the registered charity number and safeguarding policy link.
  charityNumber: null as string | null,
  // Moved from gccmi.co.uk. Set NEXT_PUBLIC_PAYPAL_URL to override.
  paypalUrl:
    process.env.NEXT_PUBLIC_PAYPAL_URL ?? "https://www.paypal.com/donate/?hosted_button_id=8FVU8F3LXRVUJ",
  // Every "Donate" button goes straight to PayPal (the /donate card page still exists but is not linked).
  donateUrl: "https://www.paypal.com/donate/?hosted_button_id=8FVU8F3LXRVUJ",
  justGivingUrl: process.env.NEXT_PUBLIC_JUSTGIVING_URL ?? null,
  contact: {
    address: ["574 Gorgie Road", "Edinburgh", "Scotland EH11 3AL", "UK"],
    phone: "+44 7563 803544",
    phoneHref: "tel:+447563803544",
    email: "info@gloriouschristianchildren.com",
  },
  social: {
    facebook: "https://www.facebook.com/groups/343516869463130/",
    instagram: "https://www.instagram.com/gccmiii/",
    youtube: "https://www.youtube.com/channel/UCTZP4O60jQZOja7ZRU4BMuQ",
  },
  store: "https://selar.co/m/GCCMISTORE",
  blog: "https://gccmiblog.wixsite.com/my-site",
  amazonBooks: "https://amzn.to/3MVBNqQ",
  aboutVideo: "https://www.youtube.com/embed/KS9CAdB8Dlo",
};

export const nav = [
  { href: "/about", label: "About" },
  { href: "/programmes/bible-club", label: "Programmes" },
  { href: "/events", label: "Events" },
  { href: "/charity-impact", label: "Impact" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/books", label: "Books" },
  { href: "/volunteer", label: "Volunteer" },
];

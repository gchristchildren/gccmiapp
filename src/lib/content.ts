/**
 * PLACEHOLDER CONTENT.
 * Everything below is sample data so the layout can be reviewed. Replace it with real
 * GCCMI copy, dates, figures and quotes before launch. In Phase 2 this moves into the
 * Supabase-backed admin area. `SHOW_SAMPLE_BADGES` flags sample sections on screen.
 */
export const SHOW_SAMPLE_BADGES = true;

export type EventCategory =
  | "Bible Club"
  | "Academy"
  | "Masterclass"
  | "Charity Outreach"
  | "Community Events";

export const eventCategories: EventCategory[] = [
  "Bible Club",
  "Academy",
  "Masterclass",
  "Charity Outreach",
  "Community Events",
];

export type GccEvent = {
  slug: string;
  title: string;
  category: EventCategory;
  date: string; // ISO date
  time: string;
  venue: string;
  address: string;
  summary: string;
  registerUrl?: string;
};

export const events: GccEvent[] = [
  {
    slug: "bible-club-autumn-term",
    title: "Bible Club: Autumn Term Starts",
    category: "Bible Club",
    date: "2026-11-07",
    time: "10:00 – 12:00",
    venue: "Community Hall (venue to be confirmed)",
    address: "London, UK",
    summary: "Weekly sessions for children with stories, memory verses and activities.",
  },
  {
    slug: "academy-winter",
    title: "GCCMI Academy: Winter Edition",
    category: "Academy",
    date: "2026-12-12",
    time: "09:30 – 16:00",
    venue: "Venue to be confirmed",
    address: "London, UK",
    summary: "Our bi-annual academy day for parents and students.",
  },
  {
    slug: "food-drive",
    title: "Community Food Drive",
    category: "Charity Outreach",
    date: "2026-12-19",
    time: "11:00 – 15:00",
    venue: "Venue to be confirmed",
    address: "London, UK",
    summary: "Collecting and distributing food parcels to local families.",
  },
  {
    slug: "masterclass-kickoff",
    title: "Masterclass Annual Kick-off",
    category: "Masterclass",
    date: "2027-01-16",
    time: "18:00 – 20:00",
    venue: "Online",
    address: "Online",
    summary: "Launch of the annual Masterclass with schedule and course overview.",
  },
  {
    slug: "academy-summer-past",
    title: "GCCMI Academy: Summer Edition",
    category: "Academy",
    date: "2026-06-20",
    time: "09:30 – 16:00",
    venue: "Venue to be confirmed",
    address: "London, UK",
    summary: "Our summer academy day. Photos and testimonials to follow.",
  },
  {
    slug: "school-supplies-past",
    title: "School Supplies Giveaway",
    category: "Charity Outreach",
    date: "2026-09-05",
    time: "10:00 – 14:00",
    venue: "Venue to be confirmed",
    address: "London, UK",
    summary: "Back-to-school packs for children in the community.",
  },
];

export const impactStats = [
  { value: "000+", label: "Children reached" },
  { value: "000", label: "Food parcels shared" },
  { value: "00", label: "Schools supported" },
  { value: "000", label: "Volunteer hours" },
];

export const impactAreas = [
  { title: "Community projects", body: "Practical projects that meet needs close to home." },
  { title: "School support", body: "Supplies, mentoring and encouragement for pupils." },
  { title: "Food donations", body: "Food parcels and meals for families who need them." },
  { title: "Outreach programmes", body: "Taking hope and help into the wider community." },
  { title: "Volunteer activities", body: "Opportunities for people to give time and skills." },
];

export const programmes = [
  {
    slug: "bible-club",
    name: "Bible Club",
    short: "Weekly Bible-based sessions for children, with memory verses and parent updates.",
    registration: "Parents create an account, register their children and pick an age group.",
    highlights: [
      "Age-grouped weekly sessions",
      "Memory verses and weekly lesson summaries",
      "Parent announcements and reminders",
      "Attendance tracking",
    ],
  },
  {
    slug: "academy",
    name: "Academy",
    short: "Our bi-annual academy for parents and students, with resources to revisit.",
    registration: "Register for each edition and access previous resources afterwards.",
    highlights: [
      "Event registration and application forms",
      "Timetable and announcements",
      "Access to previous resources",
    ],
  },
  {
    slug: "masterclass",
    name: "Masterclass",
    short: "Our premium learning area with training videos, downloads and certificates.",
    registration: "Annual registration with course schedules and certificates on completion.",
    highlights: [
      "Annual registration",
      "Course schedules and training videos",
      "Downloads and certificates",
      "Members-only access (coming later)",
    ],
  },
];

export const books = [
  { title: "Book Title One", blurb: "A short description of the book goes here.", price: "£0.00" },
  { title: "Book Title Two", blurb: "A short description of the book goes here.", price: "£0.00" },
  { title: "Book Title Three", blurb: "A short description of the book goes here.", price: "£0.00" },
  { title: "Book Title Four", blurb: "A short description of the book goes here.", price: "£0.00" },
].map((b) => ({ ...b, href: "https://www.amazon.co.uk/" }));

export const testimonials = [
  { quote: "Sample testimonial from a Bible Club parent.", name: "Parent", role: "Bible Club" },
  { quote: "Sample testimonial from an Academy student.", name: "Student", role: "Academy" },
  { quote: "Sample testimonial from a volunteer.", name: "Volunteer", role: "Outreach" },
];

export const faqs = [
  {
    q: "How do I register my child for Bible Club?",
    a: "Create a parent account, add your child, pick their age group and choose a weekly session. Online registration opens with the parent portal.",
  },
  {
    q: "Is my child's information safe?",
    a: "Yes. We collect only what we need, parents only see their own children's records, and we follow UK GDPR. Our safeguarding policy will be linked here.",
  },
  {
    q: "Where do donations go?",
    a: "Donations support our community projects, school support, food donations and outreach programmes. Card payments are processed securely by Stripe.",
  },
  {
    q: "Can I volunteer if I can only help occasionally?",
    a: "Absolutely. Tell us your skills and availability and we will match you with opportunities and events.",
  },
];

export const featuredProject = {
  title: "Featured charity project",
  body: "Replace this with the current community project: what it is, who it helps and how people can get involved.",
};

export function upcomingEvents(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function pastEvents(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const volunteerSkills = [
  "Teaching",
  "Childcare",
  "Music",
  "Media & photography",
  "Admin",
  "Cooking & catering",
  "Driving",
  "Fundraising",
  "IT",
];

/**
 * PLACEHOLDER CONTENT (events now come from the database).
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
  id: string;
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

export const coreValues = ["Excellence", "Integrity", "Social Responsibility", "Trustworthiness", "Commitment", "Passion"];

export const academySubjectsShort = "Maths, English, Coding, Web Design and more";

export const impactStats = [
  { value: "2016", label: "Free online Bible Club running since" },
  { value: "Free", label: "Bible Club for every Christian child worldwide" },
  { value: "2", label: "Live classes every week (Friday and Saturday)" },
  { value: "Annual", label: "International parenting conference" },
];

export const impactAreas = [
  { title: "Community projects", image: "/photos/pic-12.jpg", alt: "Volunteers planting a tree seedling in the soil", body: "Practical projects that meet needs close to home." },
  { title: "School support", image: "/photos/pic-13.jpg", alt: "Pupils in a classroom holding up their books", body: "Supplies, mentoring and encouragement for pupils." },
  { title: "Food donations", image: "/photos/pic-14.jpg", alt: "A box of fresh fruit and vegetables for donation", body: "Food parcels and meals for families who need them." },
  { title: "Outreach programmes", image: "/photos/pic-15.jpg", alt: "A volunteer sharing gifts with children during outreach", body: "Taking hope and help into the wider community." },
  { title: "Volunteer activities", image: "/photos/pic-16.jpg", alt: "Volunteers packing food boxes together", body: "Opportunities for people to give time and skills." },
];

export const programmes = [
  {
    slug: "bible-club",
    image: "/photos/pic-06.jpg",
    metaTitle: "Free Online Bible Club for Children",
    metaDescription: "Join GCCMI’s free online Bible Club for Christian children worldwide. Live Zoom classes every Friday and Saturday for Kids, Pre-Teens and Teens.",
    faqs: [
      { q: "Is the Bible Club really free?", a: "Yes. GCCMI’s online Bible Club is free for all Christian children worldwide and has been running since 2016." },
      { q: "When are the Bible Club classes?", a: "Classes run live on Zoom every Friday at 7pm and Saturday at 12pm for any age group, with Saturday 7pm for Kids and Pre-Teens and 8pm for Teens (UK time)." },
      { q: "What age groups does Bible Club cover?", a: "Children join one of three age groups: Kids (4–8), Pre-Teens (9–12) or Teens (13–18). Parents choose the right group when registering their child." },
      { q: "How do I join?", a: "Contact us on info@gccmi.co.uk or complete our [enquiries form](/contact)." },
      { q: "What does my child need to join?", a: "A laptop, desktop, iPad or phone with internet, a Bible, a pen and a jotter, and our weekly Bible lesson booklets, which you can [buy here](https://www.amazon.co.uk/stores/GCCM-International/author/B0B2KQKCVL?ref=ap_rdr&shoppingPortalEnabled=true)." },
    ],
    name: "Bible Club",
    short: "Our free online Bible Club teaches Christian children the Word of God, every week, from the comfort of their homes.",
    registration: "Create a parent account, register your child and choose their age group. Bible Club is free for all Christian children worldwide.",
    highlights: [
      "Free for all Christian children worldwide, running since 2016",
      "Live classes on Zoom every Friday and Saturday (UK time)",
      "Weekly assignments, memory verses and lesson summaries",
      "Bible Quiz, Easter, Summer and Christmas events",
      "Parent announcements, reminders and attendance tracking",
    ],
    sections: [
      {
        title: "Who we are",
        items: [
          "We teach children the Bible online from the comfort of their homes.",
          "We organise Bible Quiz, Easter, Summer and Christmas events for our children.",
          "We host online and offline intentional parenting workshops, seminars, hangouts and conferences.",
          "We present weekly 3-minute reflective talks with parents online.",
          "We invite speakers to speak at our Chat Show.",
        ],
      },
      {
        title: "Class schedule (UK time)",
        items: [
          "Friday: 7pm, any age group",
          "Saturday: 12pm, any age group",
          "Saturday: 7pm, Kids and Pre-Teens",
          "Saturday: 8pm, Teens",
          "Classes are held online on Zoom, so children can join from anywhere in the world.",
        ],
      },
      {
        title: "What your child needs",
        items: ["A laptop, desktop, iPad or phone with internet", "A Bible", "A pen", "A jotter"],
      },
      {
        title: "Our aims",
        items: [
          "To keep Christian children focused on God and godly things in a busy, distracting world.",
          "To ensure the Word of God supersedes the other information children absorb daily, through our weekly online classes and assignments.",
          "To equip parents with the information they need to support their parenting journey.",
          "To assist parents with other relevant children-related goals.",
        ],
      },
    ],
  },
  {
    slug: "academy",
    image: "/photos/pic-07.jpg",
    metaTitle: "Online Academy for Children: Maths, Coding and More",
    metaDescription: "GCC Academy is a flexible online programme where children learn Maths, English, Coding, Web Design, Music and more in groups on Zoom.",
    faqs: [
      { q: "What subjects does GCC Academy teach?", a: "Mathematics, English, Coding, Web Design, Music, French, Cooking, Microsoft Package and Diction." },
      { q: "How are Academy classes delivered?", a: "All classes are held live on Zoom. Students sign in to the Learning Hub to view previous classes, access resources and submit weekly assignments." },
      { q: "Do children need to be in Bible Club to join the Academy?", a: "No, but the Academy is especially helpful for children in our Bible Club and is designed to complement it." },
      { q: "How do I register for the Academy?", a: "Register for each cohort and the team will be in touch with the details." },
    ],
    name: "Academy",
    short: "GCC Academy is a flexible, supplementary online training where children learn in groups, from the comfort of their homes.",
    registration: "Register for each cohort and we will be in touch. Students sign in to the Learning Hub to view previous classes, access resources and submit weekly assignments.",
    highlights: [
      "A classical, engaging, flexible and supplementary online programme",
      "All classes are held on Zoom",
      "Especially helpful for children in our Bible Club",
      "Learning Hub with previous classes and resources",
      "Weekly assignments",
    ],
    sections: [
      {
        title: "About GCC Academy",
        items: [
          "Children are curious and energetic, and their energy should be channelled towards something positive, engaging and knowledgeable.",
          "We believe their curiosity is maximised when learning in groups with other children of the same age and core values.",
          "It is a vibrant, cost-effective, homely academy where children are enthusiastic and motivated to achieve endless possibilities through learning.",
        ],
      },
      {
        title: "Subjects",
        items: ["Mathematics", "English", "Coding", "Web Design", "Music", "French", "Cooking", "Microsoft Package", "Diction"],
      },
      {
        title: "Our objectives",
        items: [
          "To ensure all children connected to our Bible Club are excelling intellectually.",
          "To ensure our children are versatile and skilful.",
          "To improve their mental mindset and academics.",
          "To ensure our children are successful in their careers and in life.",
        ],
      },
    ],
  },
  {
    slug: "masterclass",
    image: "/photos/pic-08.jpg",
    metaTitle: "Masterclass: Online Classes for Adults and Parents",
    metaDescription: "GCCMI Masterclass offers affordable online classes for adults: intentional parenting, mental health, business and creative skills. Join live or watch later.",
    faqs: [
      { q: "Who is the Masterclass for?", a: "It is created for adults of all skill levels, including parents who want practical support alongside their children’s learning." },
      { q: "Can I join at any time?", a: "Yes. The Masterclass is a rolling programme, so students can join at any time." },
      { q: "Do I have to attend live?", a: "No. You can join live sessions and answer questions afterwards, or watch the class webinar video later." },
      { q: "How long is each session?", a: "Each session lasts 90 minutes (1 hour 30 minutes): 60 minutes of class and 30 minutes of questions and answers." },
      { q: "How does it work?", a: "Register through the portal, then register for the course you are interested in. You can join the live course sessions, or watch the class webinar video later. Joining live gives you the chance to ask questions after the class." },
      { q: "Do GCC parents get a discount?", a: "Yes. GCC parents receive discounted fees and further learning facilities." },
    ],
    name: "Masterclass",
    short: "Online classes created for adults of all skill levels: remote, dynamic, flexible, empowering, affordable and tailored.",
    registration: "Register and a member of our team will contact you. GCC parents receive discounted fees and further learning facilities.",
    highlights: [
      "Inspiring and empowering talks with leading industry figures",
      "Workshops, careers advice sessions and creative opportunities",
      "A rolling programme: students can join at any time",
      "Join live sessions, or watch the class webinar video later",
      "Discounted fees for GCC parents",
    ],
    sections: [
      {
        title: "What we offer",
        items: [
          "Mental Health in Adults",
          "Understanding Children's Mental Health and Wellbeing",
          "Understanding the Teenager's Brain",
          "Intentional Parenting",
          "Business Planning and Execution",
          "Employability",
          "Microsoft Package",
          "Graphics Design",
          "Web Design",
          "Emotional Intelligence",
          "Property Business Management",
          "Cookery",
          "Social Media Marketing",
          "Diction and Social Polish Etiquette",
        ],
      },
      {
        title: "How it works",
        items: [
          "Register through the portal.",
          "Register for the course you are interested in.",
          "You can join our live course sessions, or watch the class webinar video later.",
          "Joining live gives you the chance to ask questions after the class. Each session is 90 minutes: 60 minutes of class and 30 minutes of Q&A.",
        ],
      },
    ],
  },
];

export const testimonials = [
  { quote: "The Bible sessions are quite helpful and my children stay grounded in faith. I’m grateful for a community like this.", name: "Mrs Simisola", role: "Parent, Kent" },
  { quote: "I love to learn the word of God and the sessions excite me because I have made new friends and I look forward to seeing them.", name: "Jaden", role: "Bible Club, London" },
  { quote: "Every Christian family needs this. It’s a community and an opportunity to learn about our Lord Jesus Christ.", name: "Sarah", role: "Parent, Birmingham" },
];

export const faqs = [
  {
    q: "Is Bible Club free?",
    a: "Yes. Our online Bible Club is free for all Christian children worldwide. Classes are on Zoom every Friday and Saturday (UK time).",
  },
  {
    q: "How do I register my child for Bible Club?",
    a: "Create a parent account, add your child, and choose their age group: Kids (4–8), Pre-Teens (9–12) or Teens (13–18). You'll then see the weekly schedule and get reminders.",
  },
  {
    q: "Is my child's information safe?",
    a: "Yes. We collect only what we need, parents only see their own children's records, and we follow UK GDPR. Our safeguarding policy will be linked here.",
  },
  {
    q: "Where do donations go?",
    a: "Donations support our programmes and outreach. Card payments are processed securely by Stripe, and you can also give with PayPal.",
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

const classSlots = [
  { day: 5, hour: 19, label: "Friday at 7pm" },
  { day: 6, hour: 12, label: "Saturday at 12pm" },
];

/** The next regular Bible Club class (Friday 7pm, Saturday 12pm, UK time) and how far away it is. */
export function nextBibleClub(now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "numeric", hourCycle: "h23" })
      .formatToParts(now).map((x) => [x.type, x.value]),
  );
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  const hour = Number(p.hour);
  const ahead = classSlots
    .map((s) => ({ ...s, away: (s.day - today + 7) % 7 + (s.day === today && s.hour <= hour ? 7 : 0) }))
    .sort((a, b) => a.away - b.away)[0];
  const when = ahead.away === 0 ? "today" : ahead.away === 1 ? "tomorrow" : ahead.label.split(" ")[0];
  return { label: ahead.label, text: ahead.away <= 1 ? `Bible Club is ${when === "today" ? "today" : "tomorrow"}, ${ahead.label.split(" ").slice(1).join(" ")} (UK time).` : `Next Bible Club class: ${ahead.label} (UK time).` };
}

/** Splits events into upcoming (soonest first) and past (latest first), by calendar date. */
export function splitEvents(list: GccEvent[], now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return {
    upcoming: list.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    past: list.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Source: "GCCMI Website Policy Pack" v1.0, approved by the Trustees on 12 November 2026.
// Text can contain markdown links, e.g. [Safeguarding Policy](/safeguarding). Internal-only procedures
// (data breach, governance and financial controls) are not published on the website.

export type Block = string | string[] | { h: string } | { table: { head: string[]; rows: string[][] } };
export type PolicySection = { id: string; title: string; blocks: Block[] };
export type Policy = { path: string; title: string; short: string; description: string; sections: PolicySection[] };

export const policyMeta = {
  version: "1.0",
  effective: "5 December 2026",
  approved: "12 November 2026",
  review: "at least every 12 months",
};

const email = "info@gccmi.co.uk";
const phone = "+44 7553 517292";

export const privacyNotice: Policy = {
  path: "/privacy",
  title: "Privacy Notice",
  short: "What we collect, why, who sees it and how long we keep it.",
  description: "How GCC Ministry International collects, uses, shares and protects the personal information of parents, children, learners, donors and volunteers, under UK GDPR.",
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      blocks: [`GCCMI is the data controller for personal information collected through this website and portal. Contact: ${email}. We are subject to UK GDPR and the Data Protection Act 2018.`],
    },
    {
      id: "what-we-collect",
      title: "What we collect and why",
      blocks: [
        {
          table: {
            head: ["Who", "What we collect", "Why", "Lawful basis"],
            rows: [
              ["Parents/carers", "Name, email, phone, country, password (stored securely hashed)", "Create and run the portal account, send class links and reminders", "Contract / legitimate interests; consent for optional emails"],
              ["Children", "Name or nickname, age group, attendance, assignments, quiz scores, any medical, dietary or access needs you give us", "Run classes, track progress, keep children safe", "Parental consent / legitimate interests; explicit consent for any health information"],
              ["Adult learners (Masterclass)", "Name, email, payment details processed by our payment provider", "Provide the course", "Contract"],
              ["Donors", "Name, email, amount, Gift Aid declaration and home address (only if Gift Aid is claimed), payment reference", "Process and acknowledge gifts, claim Gift Aid, keep tax records", "Contract; legal obligation (tax records)"],
              ["Volunteers", "Name, contact details, skills, availability, references, PVG or background check information", "Match and vet volunteers, safeguard children", "Legitimate interests; legal obligation; consent where needed"],
              ["Enquirers", "Name, email, message", "Reply to you", "Legitimate interests"],
              ["Visitors", "Device, browser, pages viewed, cookies (see our [Cookie Policy](/cookies))", "Keep the site working and improve it", "Strictly necessary / consent"],
              ["Book/store customers", "Order details are handled by Selar and Amazon under their own policies", "Fulfil orders", "Contract (with those sellers)"],
            ],
          },
        },
        "We do not sell personal information. We do not use children's data for advertising or profiling.",
      ],
    },
    {
      id: "childrens-information",
      title: "Children's information",
      blocks: [
        [
          "Accounts are created by a parent or carer, who adds their child. Children do not create their own accounts.",
          "We collect only what we need to run the class and keep children safe.",
          "A parent can see and manage only their own children's records. Staff and volunteers see only what their role needs.",
          "We follow the ICO Children's Code where it applies: high-privacy settings by default, no public display of children's names or scores, and no nudging children to share more.",
          "Some live online sessions are recorded intermittently, for internal purposes only, and stored securely (see our [Safeguarding Policy](/safeguarding)).",
        ],
      ],
    },
    {
      id: "sharing",
      title: "Who we share information with",
      blocks: [
        "We share information only with service providers who help us run GCCMI, under written agreements: website hosting (Vercel), database and sign-in (Supabase), video classes (Zoom), email and notifications, card payments, donations (PayPal), forms (Google Forms), and book sales (Selar, Amazon). We may disclose information where the law requires it, or to protect a child (see our [Safeguarding Policy](/safeguarding)).",
      ],
    },
    {
      id: "retention",
      title: "How long we keep information",
      blocks: [
        {
          table: {
            head: ["Information", "Kept for"],
            rows: [
              ["Parent and child account records", "While the account is active, then 12 months after the last class, then deleted or anonymised"],
              ["Attendance and progress", "5 years, then anonymised for statistics"],
              ["Safeguarding records", "At least 7 years, as set out in our [Safeguarding Policy](/safeguarding)"],
              ["Donation and Gift Aid records", "6 years after the end of the financial year"],
              ["Volunteer records", "6 months after leaving, except vetting records"],
              ["Enquiries", "12 months"],
              ["Photos and video", "Until consent is withdrawn or 10 years, whichever is sooner"],
              ["Website logs", "90 days"],
            ],
          },
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      blocks: [
        `You can ask us to access, correct, delete or restrict the use of your information, to move it to another provider, and to object to its use. You can withdraw consent at any time (this does not affect past use). Parents can exercise these rights for their children. We reply within one month. Contact ${email}.`,
        "If you are unhappy with how we have used your information, you can complain to the Information Commissioner's Office (ico.org.uk, 0303 123 1113).",
      ],
    },
    {
      id: "security",
      title: "Security",
      blocks: ["We use encryption in transit, access controls, regular backups and activity logs. Staff, instructors and volunteers who handle data are trained. If a breach puts you at risk, we will tell you."],
    },
    {
      id: "marketing",
      title: "Marketing",
      blocks: ["We email class reminders because they are part of the service. We send newsletters or fundraising emails only with your consent, which you can withdraw using the unsubscribe link or by contacting us."],
    },
  ],
};

export const cookiePolicy: Policy = {
  path: "/cookies",
  title: "Cookie Policy",
  short: "The few cookies and similar storage this site uses.",
  description: "Which cookies and similar technologies the GCC Ministry International website uses, and how to control them.",
  sections: [
    {
      id: "cookies",
      title: "Cookies and similar technology",
      blocks: [
        [
          "Strictly necessary cookies keep you signed in and secure the parent portal. These do not need consent.",
          "Preference storage remembers your light or dark display setting on your device.",
          "We currently use no analytics cookies. If we add them, we will switch them on only if you accept.",
          "Third-party cookies may be set by embedded video (YouTube) and by payment pages (PayPal) when you use them.",
          "We do not use advertising cookies.",
        ],
        "You can change your choice at any time using your browser settings.",
      ],
    },
    {
      id: "list",
      title: "What we set",
      blocks: [
        {
          table: {
            head: ["Name", "Purpose", "Duration", "Provider"],
            rows: [
              ["Sign-in session (sb-…-auth-token)", "Keeps you signed in to the parent portal", "Until you sign out or the session expires", "GCCMI (our database provider, Supabase)"],
              ["Display setting (theme)", "Remembers light or dark mode", "Until you clear your browser storage", "GCCMI"],
              ["Offline copy of the site", "Lets the installed app load quickly and show an offline page", "Until you clear your browser storage", "GCCMI"],
            ],
          },
        },
      ],
    },
  ],
};

export const termsOfUse: Policy = {
  path: "/terms",
  title: "Website Terms of Use",
  short: "The rules for using our website and parent portal.",
  description: "The terms for using the GCC Ministry International website, parent portal and online programmes.",
  sections: [
    {
      id: "terms",
      title: "Terms of use",
      blocks: [
        [
          "Who can use the site. The site is for general use. Child accounts are created by parents or carers only. Adults using the Masterclass must be 18 or over.",
          "Accuracy. We work to keep information correct, but do not guarantee that it is complete or up to date. Event details can change.",
          "Accounts. Keep your password private and tell us at once if you think someone else has used your account. You are responsible for activity on your account.",
          "Use the site lawfully and respectfully (see [Acceptable use](/policies#acceptable-use)).",
          "Availability. We may change, pause or withdraw any part of the site, for example for maintenance. We are not liable for loss caused by interruptions beyond our control.",
          "Our responsibility. Nothing here limits liability that cannot be limited by law, including for death or personal injury caused by negligence or for fraud. Otherwise, to the extent the law allows, we are not responsible for indirect losses arising from use of the site.",
          "Linked sites are not under our control (see [External links and disclaimers](/policies#external-links)).",
          "Suspension. We may suspend or close an account that breaks these terms or puts anyone at risk.",
        ],
      ],
    },
  ],
};

export const safeguardingPolicy: Policy = {
  path: "/safeguarding",
  title: "Safeguarding Policy",
  short: "How we keep children and adults at risk safe, online and in person.",
  description: "GCC Ministry International's safeguarding policy: safer recruitment, safe online practice, the two-adult rule, and how to raise a concern.",
  sections: [
    {
      id: "commitment",
      title: "Our commitment",
      blocks: ["Every child and adult at risk who takes part in GCCMI has the right to be safe and to be protected from harm. The welfare of the child is always the first consideration. This applies to all online and in-person activity, and to everyone acting for GCCMI."],
    },
    {
      id: "roles",
      title: "Roles",
      blocks: [[`Safeguarding Lead contact information: ${email} or ${phone}`]],
    },
    {
      id: "safer-recruitment",
      title: "Safer recruitment",
      blocks: [
        [
          "Everyone who works with children (instructors, helpers, volunteers, trustees with child contact) is recruited through an application, interview, two references and identity checks.",
          "No one starts until checks are complete, and everyone completes safeguarding induction and refresher training annually.",
        ],
      ],
    },
    {
      id: "safe-online-practice",
      title: "Safe online practice",
      blocks: [
        [
          "Two-adult rule: no adult is ever alone online with a child. Every session has at least two approved adults present.",
          "Zoom links are sent only through the portal. Waiting rooms are on. Only the host admits participants, and unknown attendees are removed.",
          "Private chat between participants is switched off. Adults do not contact children through personal accounts, social media or messaging apps.",
          "Children join with cameras on or off as their parent chooses, from a shared family space (not a bedroom, where possible), with a parent or carer nearby for younger children.",
          "Sessions are recorded intermittently for internal purposes only and stored securely for 5 years.",
          "Screen-sharing, polls and breakout rooms are controlled by the host.",
          "Adult courses (Masterclass) are separate from children's sessions and never share a room with them.",
        ],
      ],
    },
    {
      id: "recognising-concerns",
      title: "Recognising concerns",
      blocks: ["Concerns can include physical, emotional or sexual abuse, neglect, bullying, online harm, radicalisation, harmful practices or anything a child says or shows that worries you. You do not need proof."],
    },
    {
      id: "raising-a-concern",
      title: "If you have a concern",
      blocks: [
        [
          "Listen, stay calm, do not promise confidentiality, do not investigate or ask leading questions.",
          "Write down what was said or seen, in the person's own words, with date and time, as soon as possible.",
          "Tell the Safeguarding Lead the same day. If the concern involves the Lead, tell the trustee responsible.",
          "The Lead decides on action and, where there is a risk of harm, makes a referral to the relevant authorities.",
          "Records are kept confidentially and only shared with those who need them.",
        ],
        "If you are worried about a child's immediate safety, contact the emergency services or the relevant authorities directly.",
      ],
    },
    {
      id: "allegations",
      title: "Allegations against adults at GCCMI",
      blocks: ["All allegations are reported immediately to the Safeguarding Lead (or the trustee responsible). The adult is removed from contact with children while the matter is looked into. Referrals are made to the relevant authorities where required."],
    },
    {
      id: "review",
      title: "Review and reporting",
      blocks: ["Trustees review safeguarding every six months and after any serious incident."],
    },
  ],
};

export const onlineRules: Policy = {
  path: "/online-classes-rules",
  title: "Online Classes and Parent Portal Rules",
  short: "What parents, children and GCCMI each agree to.",
  description: "The rules for GCC Ministry International's online classes, parent portal and in-person events, for parents, carers, children and GCCMI.",
  sections: [
    {
      id: "rules",
      title: "Parent portal and class rules",
      blocks: [
        "Parents and carers agree to:",
        [
          "keep their login and class links private and not share them on social media or WhatsApp groups;",
          "make sure children use the portal appropriately, and supervise younger children;",
          "tell us about any change to contact details, and any need we should know about (for example access or health needs) in confidence;",
          "not record, screenshot or share class content that shows other children;",
          "collect their child promptly after any in-person event.",
        ],
        "Children are asked to: be kind, take turns, keep chat polite, and tell a parent or the teacher if something upsets them.",
        "GCCMI will: start and end on time, keep two adults in every session, remove anyone who breaks the rules, and keep class links private to signed-in families only.",
        "In-person events: register with a parent or carer's contact number, keep a signed attendance record, follow our risk assessment and first-aid arrangements, and have the venue's own safety rules shared before the event.",
      ],
    },
  ],
};

export const photoPolicy: Policy = {
  path: "/photo-policy",
  title: "Photo, Video and Media Policy",
  short: "How we take, use and protect images of children and adults.",
  description: "How GCC Ministry International takes and uses photographs and video, and how parents give or withdraw consent.",
  sections: [
    {
      id: "photos",
      title: "Photos and video",
      blocks: [
        [
          "We take or publish photos and video of children only with written parental consent, given separately for each use: website, social media, printed materials, funding applications.",
          `Parents can withdraw or change consent at any time using ${email}. We will remove content from our own channels as soon as we reasonably can (we cannot control copies others have made).`,
          "Children's full names are never published next to a photo. Use first name or initials only if needed, and no location or school.",
          "Photos show children in suitable clothing and in group or activity settings. No images of children in vulnerable or distressing situations.",
          "Only GCCMI-approved devices and accounts are used to take images, which are stored securely and deleted from personal devices.",
          "Parents may take photos at events only of their own child. Do not share images of other children online.",
          "Images of adults (volunteers, instructors) are used with their consent.",
          "Stock or third-party images must be licensed for our use.",
        ],
      ],
    },
  ],
};

/** Everything else is published together on /policies, each with its own anchor. */
export const otherPolicies: PolicySection[] = [
  {
    id: "donations",
    title: "Donations, Gift Aid and fundraising",
    blocks: [
      [
        "How we receive gifts: PayPal. Payments are processed by PayPal, not stored by us.",
        "Receipts: every donor receives an acknowledgement. Monthly donors can cancel at any time through PayPal or by contacting us.",
        "Restricted gifts: gifts given for a named project are used for that project. If it is over-funded or cannot go ahead, we will use the money for a closely related purpose, and where possible tell the donor.",
        "Refunds: donations are voluntary and normally not refundable. If you gave by mistake, contact us within 14 days.",
        "Fundraising standards: we are honest and open, we do not pressure anyone, and we do not take donations from anyone who appears unable to make an informed decision.",
        "Fundraising using children: children are never used in appeals in a way that exposes their identity or exploits their situation.",
        "Suspicious or large gifts: the Treasurer checks the source of unusually large or unexpected gifts.",
        "Supporters' data is used as set out in our [Privacy Notice](/privacy). We never sell or swap donor lists.",
        "Complaints about fundraising follow the [complaints process](#complaints).",
      ],
    ],
  },
  {
    id: "fees",
    title: "Fees and refunds (Academy, Masterclass, events)",
    blocks: [
      [
        "The Bible Club is free. For Academy and Masterclass fees, contact us.",
        "Prices are shown in pounds sterling and Naira and include VAT where applicable.",
        "Cooling-off: for online courses, consumers can usually cancel within 14 days of booking. If a course has started with your agreement, we may charge for the part already used.",
        "If we cancel a class (Academy and Masterclass), we will offer a replacement session or a refund for the missed part.",
        "Refunds are paid by the original payment method within 14 days.",
        "We may remove a learner from a paid programme for serious breaches of the [code of conduct](#code-of-conduct), with a fair refund where appropriate.",
      ],
    ],
  },
  {
    id: "books",
    title: "Books and store",
    blocks: [
      [
        "Our books are sold by Amazon and Selar. Orders, delivery, returns and payment are handled by those sellers under their own terms.",
        "The site displays prices only as a guide; the seller's price at checkout applies.",
        "Tell us if a link is broken or an order did not arrive and we will help where we can.",
        "Book income is partly used by GCCMI for outreach programmes and other charity events.",
        "Our book content is protected by copyright (see [Intellectual property](#intellectual-property)).",
      ],
    ],
  },
  {
    id: "volunteers",
    title: "Volunteer policy",
    blocks: [
      [
        "Roles: volunteers support classes, events, administration, fundraising or outreach, as agreed in a short role description.",
        "Recruitment: application, interview, two references, and checks as in our [Safeguarding Policy](/safeguarding#safer-recruitment).",
        "Induction and training: safeguarding, data protection, code of conduct, emergency procedures and role-specific training.",
        "Supervision: a named coordinator supports each volunteer. Volunteers do not work unsupervised with children.",
        "Expenses: reasonable pre-agreed expenses are repaid with receipts. Volunteers are not paid and this is not employment.",
        "Data: volunteers handle personal data only as trained and instructed, and report any loss or breach straight away.",
        "Ending: either side can end the arrangement at any time. We may stop a volunteer for breach of policy or safeguarding concerns.",
        "The volunteer sign-up form collects name, contact details, skills and availability; see the [Privacy Notice](/privacy).",
      ],
    ],
  },
  {
    id: "code-of-conduct",
    title: "Code of conduct",
    blocks: [
      "Everyone acting for GCCMI (staff, trustees, instructors, volunteers) must:",
      [
        "put children's safety and wellbeing first and treat everyone with respect, dignity and patience;",
        "never be alone with a child, online or offline, and never contact a child privately;",
        "never use harsh, humiliating, threatening or inappropriate language or physical punishment;",
        "never give a child gifts, money or favours without a parent's consent, or ask a child to keep a secret;",
        "never behave in a sexual or suggestive way, or share inappropriate content;",
        "never use alcohol or drugs while working with children, or smoke or vape in front of them;",
        "respect confidentiality, and share information only with those who need it;",
        "avoid conflicts of interest and declare gifts;",
        "act as role models in line with our Christian ethos, without pressure or coercion on any child or family;",
        "report any breach, concern or near miss at once (see our [Safeguarding Policy](/safeguarding) and [complaints process](#complaints)).",
      ],
      "Breaches may lead to removal from role, referral to the authorities, and loss of access to children.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use and user content",
    blocks: [
      "Not allowed on our site, portal or classes:",
      [
        "harassment, bullying, hate or discrimination;",
        "sexual, violent or harmful content;",
        "sharing another person's personal information or images without permission;",
        "spam, advertising, scams or recruitment schemes;",
        "attempting to break in, overload or harm the site;",
        "uploading viruses, copyrighted content you have no right to share, or anything unlawful.",
      ],
      "Assignments and uploads: only upload your own work. By uploading, you give us permission to store it and show it to the relevant teacher and your family. We do not publish learners' work without separate permission.",
      "Moderation: we may remove content, warn or suspend accounts, and report unlawful content or risks to children to safeguard their interest.",
    ],
  },
  {
    id: "testimonials",
    title: "Testimonials and stories",
    blocks: [
      [
        "We publish only real feedback, with written permission from the person (or, for a child, their parent).",
        "For children we show a first name or initials only, no location, school or photo unless separately consented.",
        "We do not edit meaning, invent quotes or use \"sample\" quotes as if they were real.",
        "Each testimonial records who gave it, when, and the permission on file. Permission can be withdrawn at any time.",
        "Impact figures (children reached, countries, classes held) must be backed by records and dated.",
        "Success stories avoid identifying vulnerable families and respect confidentiality.",
      ],
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property and content",
    blocks: [
      [
        "The GCCMI name, logo, books, lesson notes, quizzes, website design and original photos and videos belong to GCCMI or are used with permission. All rights reserved.",
        "You may view and print pages for personal, non-commercial use, and share links. You may not copy, sell or republish our materials without written permission.",
        "Bible quotations are taken from NKJV and used within its publisher's permissions.",
        `We respect others' rights. We use only licensed images, fonts, music and software. If you believe the site infringes your rights, tell us at ${email} and we will act promptly.`,
        "Learner-created content belongs to the learner (see [Acceptable use](#acceptable-use)).",
      ],
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility statement",
    blocks: [
      "We want everyone to be able to use this site. We provide text alternatives for images, readable contrast, keyboard navigation, clear headings and form labels, and captions for videos where we can.",
      `If you find a barrier or need information in another format, contact ${email} or ${phone}. We aim to reply within 5 working days.`,
    ],
  },
  {
    id: "complaints",
    title: "Complaints, feedback and whistleblowing",
    blocks: [
      `Complaints. We want to hear when we get something wrong. Contact ${email}.`,
      [
        "We acknowledge within 5 working days and aim to reply fully within 25 days.",
        "If you are unhappy, ask for a review by a trustee not involved in the original matter.",
        "Complaints are recorded, reviewed by trustees, and used to improve.",
      ],
      "Safeguarding concerns are never handled as ordinary complaints; follow our [Safeguarding Policy](/safeguarding).",
    ],
  },
  {
    id: "social-media",
    title: "Social media and messaging",
    blocks: [
      [
        "Official channels are Facebook, Instagram, YouTube and TikTok, managed by named administrators.",
        "Only approved posts and images go out, following our [Photo, Video and Media Policy](/photo-policy). Children's names, schools and locations are never posted.",
        "Adults connected with GCCMI do not befriend or message children on personal accounts. Communication with children is through the portal or in the presence of a parent.",
        "Parents' messaging groups (such as WhatsApp) must be created and administered by GCCMI, include only parents who agreed, and not be used to share class links, personal data or children's images. We encourage using the portal for links and reminders instead.",
        "Comments are moderated. Bullying, hate or inappropriate content is removed and reported where required.",
        "Personal opinions posted by staff, volunteers or instructors must not be presented as GCCMI's views.",
        "Never respond to online abuse towards children; report it to the Safeguarding Lead.",
      ],
    ],
  },
  {
    id: "equality-faith",
    title: "Equality, faith and inclusion",
    blocks: [
      [
        "GCCMI is a Christian organisation. Our Bible Club and ministry teach the Christian faith. We say this openly so families can choose to join.",
        "We treat people fairly and do not discriminate on race, disability, sex, age, language or background. We make reasonable adjustments for children and adults with additional needs wherever we can.",
        "Children take part with their parents' agreement, and no child is pressured to take part in prayer or worship against the wishes of their family.",
        "We welcome families from different countries, time zones and languages, and will consider translations where we can.",
        "Bullying and discrimination are not tolerated in any session (see [Acceptable use](#acceptable-use)).",
      ],
    ],
  },
  {
    id: "external-links",
    title: "External links and disclaimers",
    blocks: [
      [
        "Our site links to other sites (for example Amazon, Selar, PayPal, YouTube, Facebook, Instagram). They are not under our control, and we are not responsible for their content or practices. Check their policies before giving them your information.",
        "Parenting and Bible-study articles and blog posts are general information and personal views of the authors. They are not professional advice (medical, legal, financial or psychological). Seek qualified help if you need it.",
        "Posts unrelated to our work, or old posts that no longer reflect our views, may be removed or archived.",
        "We aim for accuracy but cannot guarantee that the information, prices or times will always be current.",
        "If you are worried about a child's safety or health, contact the authorities, not us (see [If you have a concern](/safeguarding#raising-a-concern)).",
      ],
    ],
  },
  {
    id: "changes",
    title: "Changes, review and contact",
    blocks: [
      [
        "Trustees review these policies at least every 12 months, and sooner after a law change, a serious incident or a new service.",
        "Material changes will be shown on the site with the date. Where a change affects personal data, we will tell account holders.",
        "Older versions are kept for our records.",
      ],
      `Contact GCCMI: ${email} or ${phone}`,
    ],
  },
];

export const mainPolicies: Policy[] = [privacyNotice, cookiePolicy, termsOfUse, safeguardingPolicy, onlineRules, photoPolicy];

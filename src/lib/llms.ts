import { coreValues, faqs, programmes } from "@/lib/content";
import { fetchPosts } from "@/lib/posts";
import { abs } from "@/lib/seo";
import { site } from "@/lib/site";

const text = { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } };

const about = [
  `# ${site.fullName} (${site.name})`,
  "",
  `> ${site.description} Based in Edinburgh, Scotland, serving children and families worldwide.`,
  "",
  `${site.legalName} is a Christian charity. Its free online Bible Club has run since 2016, with live Zoom classes every Friday and Saturday (UK time).`,
].join("\n");

const pages: [string, string, string][] = [
  ["Home", "/", "Overview of Bible Club, Academy, Masterclass, events and ways to help"],
  ["About", "/about", "Mission, values and story"],
  ["Events", "/events", "Upcoming Bible Quiz, seasonal events, workshops and conferences"],
  ["Charity impact", "/charity-impact", "Community projects, school support, food donations and outreach"],
  ["Volunteer", "/volunteer", "Offer your time and skills"],
  ["Instructors", "/instructors", "Bible Club teachers and Academy instructors"],
  ["Blog", "/blog", "Articles on parenting, faith and family"],
  ["Contact", "/contact", "Address, phone and email"],
  ["Donate", "/donate", "Support the work"],
];

export async function llmsTxt() {
  const posts = await fetchPosts(10);
  const body = [
    about,
    "",
    "## Programmes",
    ...programmes.map((p) => `- [${p.name}](${abs(`/programmes/${p.slug}`)}): ${p.short}`),
    "",
    "## Key pages",
    ...pages.map(([n, path, d]) => `- [${n}](${abs(path)}): ${d}`),
    "",
    "## Recent articles",
    ...posts.map((p) => `- [${p.title}](${abs(`/blog/${p.slug}`)})${p.excerpt ? `: ${p.excerpt}` : ""}`),
    "",
    "## Optional",
    `- [Full text version for language models](${abs("/llms-full.txt")})`,
    `- [Main website](${site.mainSite})`,
    `- [Store](${site.store})`,
  ].join("\n");
  return new Response(body + "\n", text);
}

export async function llmsFullTxt() {
  const posts = await fetchPosts();
  const { address, phone, email } = site.contact;
  const body = [
    about,
    "",
    "## Contact",
    `- Address: ${address.join(", ")}`,
    `- Phone: ${phone}`,
    `- Email: ${email}`,
    `- Website: ${abs("/")}`,
    "",
    "## Core values",
    coreValues.join(", ") + ".",
    "",
    ...programmes.flatMap((p) => [
      `## ${p.name}`,
      p.short,
      "",
      ...p.highlights.map((h) => `- ${h}`),
      "",
      `How to register: ${p.registration}`,
      "",
      ...p.sections.flatMap((s) => [`### ${s.title}`, ...s.items.map((i) => `- ${i}`), ""]),
      `### ${p.name} FAQ`,
      ...p.faqs.flatMap((f) => [`**${f.q}**`, f.a, ""]),
      `Page: ${abs(`/programmes/${p.slug}`)}`,
      "",
    ]),
    "## General FAQ",
    ...faqs.flatMap((f) => [`**${f.q}**`, f.a, ""]),
    "## Articles",
    ...posts.flatMap((p) => [`### ${p.title}`, `URL: ${abs(`/blog/${p.slug}`)}`, `Published: ${p.published_at.slice(0, 10)}`, "", p.body, ""]),
  ].join("\n");
  return new Response(body + "\n", text);
}

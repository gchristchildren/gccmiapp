import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

const privatePaths = ["/portal/", "/admin/", "/api/", "/auth/", "/login", "/forgot-password", "/reset-password", "/offline", "/donate/thanks"];

// Search and AI crawlers are welcome on the public pages; training bots are allowed too so the
// charity's free programmes can be found and cited by assistants such as ChatGPT, Claude and Perplexity.
const aiBots = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "CCBot", "Amazonbot", "cohere-ai", "Bytespider", "DuckAssistBot", "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      { userAgent: aiBots, allow: ["/", "/llms.txt", "/llms-full.txt"], disallow: privatePaths },
    ],
    sitemap: abs("/sitemap.xml"),
    host: abs("/"),
  };
}

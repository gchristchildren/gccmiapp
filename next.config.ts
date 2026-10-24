import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Belt and braces: private areas and APIs never appear in search results.
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/portal/:path*", headers: noindex },
      { source: "/admin/:path*", headers: noindex },
      { source: "/api/:path*", headers: noindex },
      { source: "/auth/:path*", headers: noindex },
    ];
  },
  experimental: {
    // Keep visited pages in the browser's router cache for a short while, so going back and forth
    // between pages is instant. Saving a change always refreshes the affected pages.
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;

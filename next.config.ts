import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep visited pages in the browser's router cache for a short while, so going back and forth
    // between pages is instant. Saving a change always refreshes the affected pages.
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const api = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    return [
      { source: "/api/auth/:path*", destination: `${api}/api/auth/:path*` },
      { source: "/api/playground/run", destination: `${api}/api/playground/run` },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

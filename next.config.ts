import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentUpgrade: "security",
  },
  allowedDevOrigins: ["192.168.43.72", "192.168.1.143", "192.168.43.212","192.168.0.185","192.168.1.181",'127.0.0.1'],
  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
    ).replace(/\/+$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  output: 'export',
  basePath: '/n-menashe1',
  assetPrefix: '/n-menashe1',
  async redirects() {
    return [
      // Keep older shared YouTube links working.
      {
        source: "/videos/watch/youtube/:id",
        destination: "/watch?v=:id",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
        search: "",
      },
    ],
  },
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

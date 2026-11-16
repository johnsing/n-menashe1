import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Keep older shared links working. YouTube uses the clean URL; the
      // second rule preserves the provider for AnonMP4 and unknown IDs.
      {
        source: "/videos/watch/youtube/:id",
        destination: "/watch?v=:id",
        permanent: false,
      },
      {
        source: "/videos/watch/:provider/:id",
        destination: "/watch?v=:id&provider=:provider",
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

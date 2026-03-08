import type { NextConfig } from "next";

const ownerSlug = process.env.PORTFOLIO_OWNER_SLUG;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async rewrites() {
    if (!ownerSlug) return [];
    return [
      {
        source: "/",
        destination: `/${ownerSlug}`,
      },
    ];
  },
};

export default nextConfig;
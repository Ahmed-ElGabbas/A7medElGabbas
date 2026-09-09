import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3moma7wl9.ufs.sh",
      },
    ],
  },
};

export default nextConfig;

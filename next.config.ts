import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
  async rewrites() {
    return [
      {
        // Proxy API calls through the Next.js origin so the backend's httpOnly
        // cookies stay same-site. No CORS, no credentials in fetch calls.
        source: "/api/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;

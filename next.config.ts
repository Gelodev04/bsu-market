import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.remotePatterns", "localhost"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;

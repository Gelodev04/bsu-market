import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
   
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: 'https',
        hostname: 'market-backend-production-70a7.up.railway.app',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'market-backend-production-70a7.up.railway.app',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;

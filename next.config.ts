import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
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

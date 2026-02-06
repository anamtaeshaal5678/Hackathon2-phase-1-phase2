import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "kysely"],
  async rewrites() {
    // Only rewrite in development (local)
    // In production (Vercel), /api/backend/* is handled by vercel.json
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: "/api/backend/:path*",
          destination: process.env.BACKEND_URL
            ? `${process.env.BACKEND_URL}/:path*`
            : "http://127.0.0.1:8000/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "kysely"],
  async rewrites() {
    // Only rewrite in development to headers local python server
    // On Vercel, vercel.json handles the routing to api/index.py
    const isDev = process.env.NODE_ENV === "development";
    if (isDev || process.env.BACKEND_URL) {
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "kysely"],
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/:path*`
          : "http://localhost:8000/:path*",

      },
    ];
  },
};

export default nextConfig;

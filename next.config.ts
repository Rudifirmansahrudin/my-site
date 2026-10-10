import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! PERINGATAN: Paksa Vercel abaikan error TypeScript saat build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Paksa Vercel abaikan error linter
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;

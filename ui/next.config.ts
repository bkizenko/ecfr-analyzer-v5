import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Utilize TS and ESlint for editor assistance,
  // but do not allow errors to prevent deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

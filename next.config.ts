import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js downscaling/re-compression to preserve full high-res image quality
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

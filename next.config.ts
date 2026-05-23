import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/~offline",
  },
  // We can use default cache strategies which already do StaleWhileRevalidate for APIs and CacheFirst for static.
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);

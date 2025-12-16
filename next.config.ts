import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable dev indicators (build activity, etc.)
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the whole app is client-rendered (no API routes, no
  // server actions), so it can be hosted as plain static files on Netlify.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;

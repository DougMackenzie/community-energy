import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile mapbox-gl for SSR compatibility
  transpilePackages: ['mapbox-gl', 'react-map-gl'],
  // Set turbopack root to this directory (fixes monorepo module resolution)
  turbopack: {
    root: '.',
  },
};

export default nextConfig;

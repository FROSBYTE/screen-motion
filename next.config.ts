import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages (served from the domain root)
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Transpile Three.js ecosystem packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;

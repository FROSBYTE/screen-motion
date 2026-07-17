import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Three.js ecosystem packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  
  // Allow larger payloads for screenshot uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;

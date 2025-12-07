import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for file system access in API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
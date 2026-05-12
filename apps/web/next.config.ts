import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/shared'],
  experimental: {
    optimizePackageImports: ['@repo/ui'],
  },
};

export default nextConfig;

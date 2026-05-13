import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/shared'],
  experimental: {
    optimizePackageImports: ['@repo/ui'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.tokyolens.jp',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;

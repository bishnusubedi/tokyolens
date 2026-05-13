import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/users/admin', destination: '/admin', permanent: true },
    ]
  },
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
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
    ],
  },
};

export default nextConfig;

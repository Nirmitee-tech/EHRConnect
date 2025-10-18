import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@nirmitee.io/design-system'],

  // Optimize for faster development
  reactStrictMode: false, // Disable in dev to reduce double-rendering

  // Allow external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: '*.com',
      },
      {
        protocol: 'https',
        hostname: '*.io',
      },
    ],
  },

  // Speed up Fast Refresh
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },

  // Reduce compilation work in dev
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce the amount of work webpack does in dev mode
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
};

export default nextConfig;

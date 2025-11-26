import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@nirmitee.io/design-system'],

  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize for faster development
  reactStrictMode: false, // Disable in dev to reduce double-rendering

  // ESLint configuration - treat warnings as warnings, not errors
  eslint: {
    // Don't fail build on ESLint warnings
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    // Don't fail build on TypeScript errors (only fail on actual compilation errors)
    ignoreBuildErrors: false,
  },

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

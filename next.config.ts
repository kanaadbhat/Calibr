/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => ([
    {
      source: '/:path*',
      headers: [
        {
          key: 'Permissions-Policy',
          value: 'camera=(self), microphone=(self), fullscreen=(self)'
        }
      ]
    }
  ]),
  reactStrictMode: true,
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Fix for face-api.js in browser (ignore Node.js modules)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        os: false,
        encoding: false,
      };
      
      // Suppress warnings for optional dependencies
      config.ignoreWarnings = [
        { module: /node_modules\/node-fetch\/lib\/index\.js/ },
        { module: /node_modules\/encoding/ },
      ];
    }
    return config;
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

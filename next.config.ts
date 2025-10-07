/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => ([
    {
      source: '/:path*',
      headers: [
        {
          key: 'Permissions-Policy',
          value: 'camera=(self), microphone=(self)'
        }
      ]
    }
  ]),
  reactStrictMode: true,
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

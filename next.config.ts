/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => ([
    {
      source: '/:path*',
      headers: [
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=()'
        }
      ]
    }
  ])
}

module.exports = nextConfig
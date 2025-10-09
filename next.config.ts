import { NextConfig } from 'next'

const path = require('path')
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  // output: 'export',
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'hkpbb36pmnqgqbnx.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  outputFileTracingExcludes: {
    '/**': ['./markdown-content/Other'],
  },
  outputFileTracingIncludes: {
    '/': ['./markdown-content/**/*.md'],
  },
  rewrites: async () => [
    {
      source: '/api/data/:match*',
      destination: 'https://graescence.com/_vercel/insights/:match*',
    },
  ],
}

module.exports = nextConfig

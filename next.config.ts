import { NextConfig } from 'next'

const path = require('path')
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  // output: 'export',
  images: { unoptimized: false },
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

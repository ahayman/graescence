import { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
})

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
}

module.exports = withSerwist(nextConfig)

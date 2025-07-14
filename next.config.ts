import CopyWebpackPlugin from 'copy-webpack-plugin'
import { NextConfig } from 'next'

const path = require('path')
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
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

module.exports = nextConfig

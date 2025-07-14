import CopyWebpackPlugin from 'copy-webpack-plugin'
import { NextConfig } from 'next'

const path = require('path')
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  // output: 'export',
  images: { unoptimized: true },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  outputFileTracingExcludes: {
    '/**': ['./markdown-content/Other'],
  },
  outputFileTracingIncludes: {
    '/app/**': [
      './markdown-content/Blog',
      './markdown-content/Chapters',
      './markdown-content/History',
      './markdown-content/Lore',
      './markdown-content/Pages',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'markdown-content/Blog/', // Source folder for your content files
              to: 'markdown-content/Blog/', // Destination folder within .next/server
            },
            {
              from: 'markdown-content/Chapters/', // Source folder for your content files
              to: 'markdown-content/Chapters/', // Destination folder within .next/server
            },
            {
              from: 'markdown-content/History/', // Source folder for your content files
              to: 'markdown-content/History/', // Destination folder within .next/server
            },
            {
              from: 'markdown-content/Lore/', // Source folder for your content files
              to: 'markdown-content/Lore/', // Destination folder within .next/server
            },
            {
              from: 'markdown-content/Pages/', // Source folder for your content files
              to: 'markdown-content/Pages/', // Destination folder within .next/server
            },
          ],
        }),
      )
    }
    return config
  },
}

module.exports = nextConfig

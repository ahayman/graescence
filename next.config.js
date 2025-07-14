/** @type {import('next').NextConfig} */
const path = require('path')
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  // output: 'export',
  images: { unoptimized: true },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  // outputFileTracingExcludes: {
  //   '/**': ['markdown-content/Other'],
  // },
  outputFileTracingIncludes: {
    '/**': [
      'markdown-content/Blog',
      'markdown-content/Chapters',
      'markdown-content/History',
      'markdown-content/Lore',
      'markdown-content/Pages',
    ],
  },
}

module.exports = nextConfig

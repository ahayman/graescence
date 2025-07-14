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
  outputFileTracingExcludes: {
    '/**': [
      'markdown-content/Other',
      'markdown-content/Stash',
      'markdown-content/.*',
      'markdown-content/README.md',
      'markdown-content/Arcs',
      'markdown-content/rechapter.py',
      'markdown-content/wordcount.sh',
    ],
  },
}

module.exports = nextConfig

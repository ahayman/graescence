/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const nextConfig = {
  assetPrefix: isProd ? '/graescence/' : '',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig

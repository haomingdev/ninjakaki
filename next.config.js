/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'dist/client',
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

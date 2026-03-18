/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable Next.js route handler caching entirely
  experimental: {
    isrFlushToDisk: false,
  },
}

module.exports = nextConfig

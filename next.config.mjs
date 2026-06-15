/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.minimize = false
    }
    return config
  },
}

export default nextConfig

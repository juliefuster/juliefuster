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
  webpack: (config, { isServer, webpack }) => {
    let last = ""
    config.plugins.push(
      new webpack.ProgressPlugin((percentage, message, ...args) => {
        const line = `[wp:${isServer ? "server" : "client"}] ${(percentage * 100).toFixed(1)}% ${message} ${args.join(" ")}`
        if (line !== last) {
          // eslint-disable-next-line no-console
          console.error(line)
          last = line
        }
      }),
    )
    return config
  },
}

export default nextConfig

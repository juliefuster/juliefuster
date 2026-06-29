/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr", "@supabase/realtime-js"],
}

export default nextConfig

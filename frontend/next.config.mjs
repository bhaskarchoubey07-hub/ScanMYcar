/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co"
      }
    ]
  },
  transpilePackages: ["react-leaflet", "leaflet"]
};

export default nextConfig;

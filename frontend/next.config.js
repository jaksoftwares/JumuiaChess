/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'mock.supabase.co'],
  },
};

module.exports = nextConfig;

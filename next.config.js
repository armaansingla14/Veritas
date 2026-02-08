/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // For Leaflet SSR compatibility
  transpilePackages: ['react-leaflet', 'leaflet'],
};

module.exports = nextConfig;

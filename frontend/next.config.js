/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable React 19 features if needed
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
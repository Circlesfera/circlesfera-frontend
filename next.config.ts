import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // Temporalmente deshabilitado para despliegue
  },
  // Proxy para redirigir peticiones API al backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:5001/api/:path*`,
      },
    ];
  },
  // Headers para forzar recarga en móvil
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    domains: process.env.NEXT_PUBLIC_IMAGE_DOMAINS
      ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(',')
      : ['localhost', 'res.cloudinary.com', 'dev-api.circlesfera.com'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;

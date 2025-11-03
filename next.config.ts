import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'sonner']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.circlesfera.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com'
      },
      // MinIO local y desarrollo
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: '::1',
        port: '9000',
        pathname: '/**'
      },
      // MinIO Docker (cuando frontend corre en Docker)
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/**'
      }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }
  ]
};

export default nextConfig;


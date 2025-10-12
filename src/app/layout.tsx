import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ThemeProvider } from '@/features/theme/ThemeContext';
import { ToastProvider } from '@/components/Toast';
import { ToastContainer } from '@/components/Toast';
import AppLayout from '@/components/layout/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineIndicator from '@/components/OfflineIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CircleSfera - Red Social Moderna',
    template: '%s | CircleSfera'
  },
  description: 'Red social moderna para compartir videos cortos, reels, historias y conectar con amigos. Crea contenido increíble y descubre momentos únicos.',
  keywords: [
    'red social',
    'videos cortos',
    'reels',
    'stories',
    'historias',
    'mensajería',
    'compartir fotos',
    'compartir videos',
    'instagram alternativa',
    'tiktok alternativa',
    'circlesfera'
  ],
  authors: [{ name: 'CircleSfera Team' }],
  creator: 'CircleSfera',
  publisher: 'CircleSfera',
  applicationName: 'CircleSfera',
  generator: 'Next.js',

  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://circlesfera.com',
    siteName: 'CircleSfera',
    title: 'CircleSfera - Red Social Moderna',
    description: 'Red social moderna para compartir videos cortos, reels, historias y conectar con amigos',
    images: [
      {
        url: '/icons/icon-512x512.svg',
        width: 512,
        height: 512,
        alt: 'CircleSfera Logo'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'CircleSfera - Red Social Moderna',
    description: 'Red social moderna para compartir videos cortos, reels, historias y conectar con amigos',
    creator: '@circlesfera',
    images: ['/icons/icon-512x512.svg']
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },

  icons: {
    icon: '/icons/icon-192x192.svg',
    shortcut: '/icons/icon-192x192.svg',
    apple: '/icons/icon-192x192.svg'
  },

  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CircleSfera" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="antialiased bg-white text-gray-900 transition-colors duration-200">
        <ErrorBoundary>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <OfflineIndicator />
                <AppLayout>
                  {children}
                </AppLayout>
                <ToastContainer />
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

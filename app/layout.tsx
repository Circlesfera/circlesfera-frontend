import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactElement, ReactNode } from 'react';

import '@/styles/globals.css';

import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CircleSfera — Experiencias sociales inmersivas',
  description:
    'Comparte historias visuales, descubre comunidades y conversa en tiempo real desde cualquier dispositivo.',
  applicationName: 'CircleSfera',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  openGraph: {
    title: 'CircleSfera',
    description: 'Red social de contenido inmersivo con vídeo corto, streaming y analítica en tiempo real.',
    url: 'https://app.circlesfera.com',
    siteName: 'CircleSfera',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@circlesfera'
  }
};

export const viewport: Viewport = {
  themeColor: '#1f7efe'
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

/**
 * Layout raíz responsable de aplicar tipografías, proveedores globales y metadatos.
 */
export default function RootLayout({ children }: RootLayoutProps): ReactElement {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Script inline para aplicar el tema antes de que React se hidrate y evitar FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  const theme = storedTheme || 'system';
                  const effectiveTheme = theme === 'system' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : theme;
                  
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  // Fallback: usar preferencia del sistema o dark por defecto
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  if (systemTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                }
              })();
            `
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


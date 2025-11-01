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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
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
      <body className="bg-slate-950 text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


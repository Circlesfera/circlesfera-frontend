import './globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';
import { AuthProvider } from '../features/auth/AuthContext';

export const metadata: Metadata = {
  title: 'CircleSfera - Comparte tus momentos',
  description: 'Una plataforma para compartir fotos y conectar con amigos',
  keywords: 'fotos, social media, compartir, amigos, CircleSfera',
  authors: [{ name: 'CircleSfera Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0095f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Header />
          <main className="pt-16 min-h-screen">
            <div className="max-w-4xl mx-auto px-4">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';
import { AuthProvider } from '../features/auth/AuthContext';

export const metadata: Metadata = {
  title: 'CircleSfera - Comparte tus momentos',
  description: 'Una plataforma moderna para compartir fotos y conectar con amigos',
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
    <html lang="es" className="scroll-smooth">
      <body className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
        <AuthProvider>
          <div className="relative">
            {/* Header fijo */}
            <Header />
            
            {/* Contenido principal */}
            <main className="pt-16 min-h-screen">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            
            {/* Fondo decorativo */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

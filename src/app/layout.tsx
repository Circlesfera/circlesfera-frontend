import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import FloatingActionButton from '@/components/FloatingActionButton';
import { AuthProvider } from '@/features/auth/AuthContext';

export const metadata: Metadata = {
  title: 'CircleSfera - Conecta y comparte',
  description: 'Una plataforma para compartir momentos especiales y conectar con amigos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <AuthProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <FloatingActionButton />
        </AuthProvider>
      </body>
    </html>
  );
}

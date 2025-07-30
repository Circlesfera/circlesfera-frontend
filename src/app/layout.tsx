import './globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { AuthProvider } from '../features/auth/AuthContext';

export const metadata: Metadata = {
  title: 'CircleSfera',
  description: 'Clon de Instagram en Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <AuthProvider>
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen pt-16 px-2 md:pl-56 md:px-0 w-full max-w-full">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

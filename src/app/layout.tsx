import './globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

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
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen pt-16 md:pl-56 px-2 md:px-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

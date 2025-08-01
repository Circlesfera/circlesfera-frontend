"use client";

import { useAuth } from '@/features/auth/useAuth';

export default function DebugAuth() {
  const { user, token, loading } = useAuth();

  if (typeof window === 'undefined') {
    return <div>SSR - No hay información disponible</div>;
  }

  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Auth</h3>
      <div className="text-xs space-y-1">
        <div><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</div>
        <div><strong>User:</strong> {user ? user.username : 'No'}</div>
        <div><strong>Token:</strong> {token ? 'Sí' : 'No'}</div>
        <div><strong>Stored Token:</strong> {storedToken ? 'Sí' : 'No'}</div>
        <div><strong>Stored User:</strong> {storedUser ? 'Sí' : 'No'}</div>
        <div><strong>Window:</strong> {typeof window !== 'undefined' ? 'Sí' : 'No'}</div>
      </div>
    </div>
  );
} 
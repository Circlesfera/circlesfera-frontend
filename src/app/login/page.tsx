"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white border border-gray-200 p-8 mb-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">CircleSfera</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="text-red-500 text-sm text-center mb-3">{error}</div>}
            
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-1.5 rounded font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
        
        <div className="bg-white border border-gray-200 p-4 text-center">
          <p className="text-gray-900 text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-blue-500 font-semibold hover:opacity-70 transition-opacity">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

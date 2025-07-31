"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || 'Error al registrarse';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white border border-gray-200 p-8 mb-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">CircleSfera</h1>
            <p className="text-gray-400 text-base font-semibold">
              Regístrate para ver fotos y videos de tus amigos.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="text-red-500 text-sm text-center mb-3">{error}</div>}
            
            <input
              type="text"
              placeholder="Nombre de usuario"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            
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
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        </div>
        
        <div className="bg-white border border-gray-200 p-4 text-center">
          <p className="text-gray-900 text-sm">
            ¿Tienes una cuenta?{' '}
            <Link href="/login" className="text-blue-500 font-semibold hover:opacity-70 transition-opacity">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

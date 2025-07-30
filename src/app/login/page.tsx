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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-2">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto flex flex-col gap-4 border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-center text-blue-600">Iniciar sesión en CircleSfera</h1>
        {error && <div className="mb-2 text-red-500 text-sm text-center">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="mt-2 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}

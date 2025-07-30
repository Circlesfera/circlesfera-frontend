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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Regístrate en CircleSfera</h1>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        <input
          type="text"
          placeholder="Nombre de usuario"
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-6 px-3 py-2 border rounded focus:outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}

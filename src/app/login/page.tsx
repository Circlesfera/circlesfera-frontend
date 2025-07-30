import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica de login con la API
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Iniciar sesión en CircleSfera</h1>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
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
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Entrar</button>
        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}

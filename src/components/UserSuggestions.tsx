"use client";

import React, { useEffect, useState } from 'react';
import { getSuggestions, UserSuggestion } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';
import FollowButton from './FollowButton';

export default function UserSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getSuggestions().then(data => {
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {

        setError('Error al cargar sugerencias');
        setSuggestions([]);
      }
      setLoading(false);
    }).catch(error => {

      setError('Error al cargar sugerencias');
      setSuggestions([]);
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Sugerencias para ti</h3>
        <button className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          Ver todo
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-2 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-xs">No hay sugerencias por ahora</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion._id}
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                {suggestion.avatar ? (
                  <img
                    src={suggestion.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center font-bold text-white text-sm">
                    {suggestion?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Información del usuario */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">
                  {suggestion.username}
                </div>
                <div className="text-gray-500 text-xs truncate">
                  {suggestion.bio || 'Sugerido para ti'}
                </div>
              </div>

              {/* Botón de seguir */}
              <div className="flex-shrink-0">
                <FollowButton
                  userId={suggestion._id}
                  initialFollowing={false}
                  onChangeAction={() => setSuggestions(suggestions.filter(u => u._id !== suggestion._id))}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer con enlaces */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-gray-400 text-xs">
          {/* Enlaces principales */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
            {[
              'Sobre nosotros', 'Ayuda', 'Prensa', 'API',
              'Empleos', 'Privacidad', 'Términos', 'Ubicaciones'
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-gray-600 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center mt-3">
            <span>© 2024 </span>
            <span className="font-semibold text-gray-600">CircleSfera</span>
            <span> desde España</span>
          </div>
        </div>
      </div>
    </div>
  );
}

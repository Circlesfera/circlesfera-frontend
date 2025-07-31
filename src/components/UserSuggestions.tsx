"use client";

import React, { useEffect, useState } from 'react';
import { getSuggestions, UserSuggestion } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';
import FollowButton from './FollowButton';

// Iconos SVG modernos
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

export default function UserSuggestions() {
  const { token, user } = useAuth();
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getSuggestions(token).then(data => {
      setSuggestions(data);
      setLoading(false);
    });
  }, [token]);

  if (!user) return null;

  return (
    <div className="card-modern p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <UsersIcon />
          <h3 className="font-semibold text-gray-900 text-sm">Sugerencias para ti</h3>
        </div>
        <button className="text-blue-600 font-semibold text-xs hover:text-blue-700 transition-colors">
          Ver todo
        </button>
      </div>
      
      {/* Contenido */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-2 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <UsersIcon />
          </div>
          <p className="text-gray-500 text-sm">No hay sugerencias por ahora</p>
          <p className="text-gray-400 text-xs">Vuelve más tarde</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, idx) => (
            <div 
              key={suggestion._id} 
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Avatar */}
              <div className="relative">
                {suggestion.avatar ? (
                  <img 
                    src={suggestion.avatar} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                    {suggestion.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Información del usuario */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate hover:text-blue-600 transition-colors cursor-pointer">
                  {suggestion.username}
                </div>
                {suggestion.bio && (
                  <div className="text-gray-500 text-xs truncate mt-1">
                    {suggestion.bio}
                  </div>
                )}
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-gray-400 text-xs">Seguido por</span>
                  <span className="text-gray-600 text-xs font-medium">usuario_común</span>
                </div>
              </div>
              
              {/* Botón de seguir */}
              <FollowButton 
                userId={suggestion._id} 
                initialFollowing={false} 
                onChange={() => setSuggestions(suggestions.filter(u => u._id !== suggestion._id))} 
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Footer con enlaces */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="text-gray-400 text-xs space-y-4">
          {/* Enlaces principales */}
          <div className="flex flex-wrap gap-2">
            {[
              'Sobre nosotros', 'Ayuda', 'Prensa', 'API', 
              'Empleos', 'Privacidad', 'Términos', 'Ubicaciones', 'Idioma'
            ].map((link, idx) => (
              <React.Fragment key={link}>
                <a 
                  href="#" 
                  className="hover:text-gray-600 hover:underline transition-colors flex items-center space-x-1"
                >
                  <LinkIcon />
                  <span>{link}</span>
                </a>
                {idx < 8 && <span className="text-gray-300">•</span>}
              </React.Fragment>
            ))}
          </div>
          
          {/* Copyright */}
          <div className="flex items-center justify-center space-x-2">
            <span>© 2024</span>
            <span className="text-gradient-accent font-semibold">CircleSfera</span>
            <span>desde España</span>
          </div>
        </div>
      </div>
    </div>
  );
}
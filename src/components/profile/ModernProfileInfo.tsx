"use client";

import React from 'react';
import { User } from '@/types';
import { formatDate } from '@/utils/format';

interface ModernProfileInfoProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ModernProfileInfo({ user, isOwnProfile }: ModernProfileInfoProps) {
  const hasAdditionalInfo = user.location || user.birthDate || user.website;

  if (!hasAdditionalInfo && !isOwnProfile) {
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50/30"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full -translate-y-16 -translate-x-16"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-100/40 to-transparent rounded-full translate-y-12 translate-x-12"></div>
      
      <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 lg:p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Privacy Status - Enhanced */}
          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
              {user.isPrivate ? (
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Estado de cuenta</div>
              <div className="font-semibold text-gray-900">
                {user.isPrivate ? 'Cuenta privada' : 'Cuenta pública'}
              </div>
            </div>
          </div>

          {/* Location - Enhanced */}
          {user.location && (
            <div className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Ubicación</div>
                <div className="font-semibold text-gray-900">{user.location}</div>
              </div>
            </div>
          )}

          {/* Birth Date (only for own profile) - Enhanced */}
          {isOwnProfile && user.birthDate && (
            <div className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Fecha de nacimiento</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(user.birthDate)}
                </div>
              </div>
            </div>
          )}

          {/* Website - Enhanced */}
          {user.website && (
            <div className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-100 to-blue-100 group-hover:from-indigo-200 group-hover:to-blue-200 transition-all duration-300">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-600">Sitio web</div>
                <a 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 break-all block truncate"
                >
                  {user.website}
                </a>
              </div>
            </div>
          )}

          {/* Account Creation Date - Enhanced */}
          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-300">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Miembro desde</div>
              <div className="font-semibold text-gray-900">
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>

          {/* Last Seen - Enhanced */}
          {user.lastSeen && (
            <div className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Última actividad</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(user.lastSeen)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

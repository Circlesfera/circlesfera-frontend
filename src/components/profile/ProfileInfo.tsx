"use client";

import React from 'react';
import { User } from '@/types';
import { 
  LocationIcon, 
  CalendarIcon, 
  LinkIcon, 
  PrivateIcon, 
  PublicIcon 
} from './ProfileIcons';
import { formatDate } from '@/utils/format';

interface ProfileInfoProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileInfo({ user, isOwnProfile }: ProfileInfoProps) {
  const hasAdditionalInfo = user.location || user.birthDate || user.website;

  if (!hasAdditionalInfo && !isOwnProfile) {
    return null;
  }

  return (
    <div className="bg-white rounded-none sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Privacy Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {user.isPrivate ? (
              <PrivateIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            ) : (
              <PublicIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            )}
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {user.isPrivate ? 'Cuenta privada' : 'Cuenta pública'}
            </span>
          </div>
        </div>

        {/* Location */}
        {user.location && (
          <div className="flex items-center gap-3">
            <LocationIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs sm:text-sm text-gray-700">{user.location}</span>
          </div>
        )}

        {/* Birth Date (only for own profile) */}
        {isOwnProfile && user.birthDate && (
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs sm:text-sm text-gray-700">
              Nacido el {formatDate(user.birthDate)}
            </span>
          </div>
        )}

        {/* Website */}
        {user.website && (
          <div className="flex items-center gap-3">
            <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <a 
              href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 break-all"
            >
              {user.website}
            </a>
          </div>
        )}

        {/* Account Creation Date */}
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          <span className="text-xs sm:text-sm text-gray-700">
            Se unió en {formatDate(user.createdAt)}
          </span>
        </div>

        {/* Last Seen */}
        {user.lastSeen && (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-700">
              Activo {formatDate(user.lastSeen)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

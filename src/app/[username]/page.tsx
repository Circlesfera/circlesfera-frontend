"use client";

import { notFound } from 'next/navigation';
import { getUserProfileByUsername, UserProfile } from '@/services/userService';
import ClientProfilePage from './ClientProfilePage';
import { useEffect, useState } from 'react';
import logger from '@/utils/logger';

const RESERVED_ROUTES = [
  'login', 'register', 'explore', 'messages', 'notifications', 'profile', 'api'
];

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { username } = await params;

        if (RESERVED_ROUTES.includes(username.toLowerCase())) {
          setError(true);
          return;
        }

        const profileData = await getUserProfileByUsername(username);
        setProfile(profileData);
      } catch (loadProfileError) {
        logger.error('Error loading user profile page:', {
          error: loadProfileError instanceof Error ? loadProfileError.message : 'Unknown error'
        });
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar cuando estemos en el cliente
    if (typeof window !== 'undefined') {
      loadProfile();
    }
  }, [params]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-2">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return notFound();
  }

  return <ClientProfilePage profile={profile} />;
}

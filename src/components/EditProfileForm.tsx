"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { checkUsernameAvailability, editProfile, User } from '@/services/userService';
import { useAuth } from '@/features/auth/useAuth';
import logger from '@/utils/logger';

interface EditProfileFormProps {
  profile: User;
  onSave: (updatedData: Partial<User>) => Promise<void>;
  onCancel: () => void;
}

export default function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    username: profile.username || '',
    fullName: profile.fullName || '',
    bio: profile.bio || '',
    website: profile.website || '',
    location: profile.location || '',
    phone: profile.phone || '',
    gender: profile.gender || 'prefer-not-to-say',
    birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
    isPrivate: profile.isPrivate || false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameChanged, setUsernameChanged] = useState(false);
  const [originalUsername] = useState(profile.username);
  const [usernameAvailability, setUsernameAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    lastChecked: string;
  }>({
    checking: false,
    available: null,
    lastChecked: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar disponibilidad de username con debounce
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameAvailability(prev => ({ ...prev, available: null, checking: false }));
        return;
      }

      if (formData.username === originalUsername) {
        setUsernameAvailability(prev => ({ ...prev, available: true, checking: false }));
        return;
      }

      setUsernameAvailability(prev => ({ ...prev, checking: true }));

      try {
        const result = await checkUsernameAvailability(formData.username);
        setUsernameAvailability({
          checking: false,
          available: result.available,
          lastChecked: formData.username
        });
      } catch (checkError) {
        logger.error('Error checking username availability:', {
          error: checkError instanceof Error ? checkError.message : 'Unknown error',
          username: formData.username
        });
        setUsernameAvailability(prev => ({ ...prev, checking: false }));
      }
    };

    const timeoutId = setTimeout(checkUsername, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [formData.username, originalUsername]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Detectar si el username ha cambiado
    if (name === 'username') {
      setUsernameChanged(value !== originalUsername);
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Por favor selecciona una imagen válida' }));
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, avatar: 'La imagen es demasiado grande. Máximo 5MB' }));
      return;
    }

    setAvatarFile(file);
    setErrors(prev => ({ ...prev, avatar: '' }));

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await editProfile(formData);

      // Actualizar el perfil local
      setAvatarFile(null);
      setAvatarPreview(null);

      // Actualizar el usuario en el contexto de autenticación
      await refreshUser();

      // Notificar al componente padre sobre la actualización del avatar
      if (response.user && response.user.avatar) {
        await onSave({ avatar: response.user.avatar });
        logger.info('Avatar uploaded successfully');
      }

    } catch (error: unknown) {
      logger.error('Error uploading avatar:', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      setErrors(prev => ({
        ...prev,
        avatar: errorMessage
      }));
    } finally {
      setAvatarUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar username
    if (formData.username) {
      if (formData.username.length < 3 || formData.username.length > 30) {
        newErrors.username = 'El nombre de usuario debe tener entre 3 y 30 caracteres';
      } else if (!formData.username.match(/^[a-zA-Z0-9_]+$/)) {
        newErrors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
      } else if (formData.username !== originalUsername && usernameAvailability.available === false) {
        newErrors.username = 'Este nombre de usuario no está disponible';
      }
    }

    if (formData.fullName && formData.fullName.length > 50) {
      newErrors.fullName = 'El nombre completo no puede exceder 50 caracteres';
    }

    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'La biografía no puede exceder 160 caracteres';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'La URL debe comenzar con http:// o https://';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'La ubicación no puede exceder 100 caracteres';
    }

    if (formData.phone && !formData.phone.match(/^\+?[\d\s\-\(\)]+$/)) {
      newErrors.phone = 'Por favor ingresa un número de teléfono válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para envío, excluyendo campos vacíos
      const dataToSave: Partial<User> = {
        username: formData.username,
        fullName: formData.fullName,
        bio: formData.bio,
        website: formData.website,
        location: formData.location,
        phone: formData.phone,
        gender: formData.gender,
        isPrivate: formData.isPrivate,
      };

      if (formData.birthDate) {
        dataToSave.birthDate = formData.birthDate;
      }

      await onSave(dataToSave);
      logger.info('Profile updated successfully');
    } catch (saveError) {
      logger.error('Error saving profile:', {
        error: saveError instanceof Error ? saveError.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Editar perfil</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Vista previa del avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-300"
              />
            ) : profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={`Avatar de ${profile.username}`}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">{profile.username}</div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleChangePhotoClick}
                disabled={avatarUploading}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 dark:text-blue-400 dark:hover:text-blue-300 disabled:cursor-not-allowed"
              >
                {avatarPreview ? 'Cambiar imagen' : 'Cambiar foto de perfil'}
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  disabled={avatarUploading}
                  className="text-green-600 hover:text-green-800 text-sm font-medium disabled:text-gray-400 dark:text-green-400 dark:hover:text-green-300 disabled:cursor-not-allowed"
                >
                  {avatarUploading ? 'Subiendo...' : 'Guardar'}
                </button>
              )}
            </div>
            {errors.avatar && (
              <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>
            )}
            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Nombre de usuario */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre de usuario
            {usernameChanged && (
              <span className="text-orange-600 ml-2 text-xs">
                ⚠️ Cambiado
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`input-modern pr-10 ${errors.username ? 'border-red-500' : ''} ${usernameChanged ? 'border-orange-300 bg-orange-50' : ''} ${usernameAvailability.available === true ? 'border-green-500' : ''} ${usernameAvailability.available === false ? 'border-red-500' : ''}`}
              placeholder="nombre_usuario"
              disabled={loading}
            />
            {/* Indicador de disponibilidad */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {usernameAvailability.checking && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {!usernameAvailability.checking && formData.username && formData.username.length >= 3 && (
                <>
                  {usernameAvailability.available === true && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {usernameAvailability.available === false && (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </>
              )}
            </div>
          </div>
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
          {usernameChanged && (
            <p className="text-orange-600 text-sm mt-1">
              ⚠️ Una vez cambiado, no podrás volver a usar tu nombre de usuario anterior hasta que lo cambies de nuevo
            </p>
          )}
          {!errors.username && usernameAvailability.available === true && formData.username !== originalUsername && (
            <p className="text-green-600 text-sm mt-1">
              ✅ Este nombre de usuario está disponible
            </p>
          )}
        </div>

        {/* Nombre completo */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`input-modern ${errors.fullName ? 'border-red-500' : ''}`}
            placeholder="Ingresa tu nombre completo"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Biografía */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Biografía
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className={`input-modern resize-none ${errors.bio ? 'border-red-500' : ''}`}
            placeholder="Cuéntanos sobre ti..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio}</p>
            )}
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-auto">
              {formData.bio.length}/160
            </span>
          </div>
        </div>

        {/* Sitio web */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sitio web
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={`input-modern ${errors.website ? 'border-red-500' : ''}`}
            placeholder="https://tu-sitio-web.com"
          />
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">{errors.website}</p>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`input-modern ${errors.location ? 'border-red-500' : ''}`}
            placeholder="Ciudad, País"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`input-modern ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Género */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Género
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-modern"
          >
            <option value="prefer-not-to-say">Prefiero no decirlo</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="input-modern"
          />
        </div>

        {/* Cuenta privada */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isPrivate"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cuenta privada
          </label>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="spinner"></div>
                <span>Guardando...</span>
              </div>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

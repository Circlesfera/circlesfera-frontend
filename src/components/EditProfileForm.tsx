"use client";

import React, { useState } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  website?: string;
  location?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  isPrivate?: boolean;
  avatar?: string;
}

interface EditProfileFormProps {
  profile: User;
  onSave: (updatedData: Partial<User>) => Promise<void>;
  onCancel: () => void;
}

export default function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar username
    if (formData.username) {
      if (formData.username.length < 3 || formData.username.length > 30) {
        newErrors.username = 'El nombre de usuario debe tener entre 3 y 30 caracteres';
      } else if (!formData.username.match(/^[a-zA-Z0-9_]+$/)) {
        newErrors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
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
      await onSave(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Editar perfil</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt="avatar" 
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200" 
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                {profile.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{profile.username}</div>
            <button type="button" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Cambiar foto de perfil
            </button>
          </div>
        </div>

        {/* Nombre de usuario */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de usuario
            {usernameChanged && (
              <span className="text-orange-600 ml-2 text-xs">
                ⚠️ Cambiado
              </span>
            )}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`input-modern ${errors.username ? 'border-red-500' : ''} ${usernameChanged ? 'border-orange-300 bg-orange-50' : ''}`}
            placeholder="nombre_usuario"
            disabled={loading}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
          {usernameChanged && (
            <p className="text-orange-600 text-sm mt-1">
              ⚠️ Una vez cambiado, no podrás volver a usar tu nombre de usuario anterior hasta que lo cambies de nuevo
            </p>
          )}
        </div>

        {/* Nombre completo */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
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
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
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
            <span className="text-gray-500 text-sm ml-auto">
              {formData.bio.length}/160
            </span>
          </div>
        </div>

        {/* Sitio web */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
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
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
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
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
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
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
            Cuenta privada
          </label>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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

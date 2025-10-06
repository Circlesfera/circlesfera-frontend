"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';
import { getUserProfile, updateUserProfile, User } from '@/services/userService';
import { getUserSettings, updatePrivacySettings, updateNotificationSettings, updateSecuritySettings, changePassword, toggleTwoFactor, PrivacySettings, NotificationSettings, SecuritySettings } from '@/services/settingsService';
import EditProfileForm from '@/components/EditProfileForm';
import Link from 'next/link';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  changePasswordSchema,
  privacySettingsSchema,
  notificationSettingsSchema,
  securitySettingsSchema
} from '@/schemas/settingsSchema';

// Iconos SVG
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const PrivacyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4a2 2 0 00-1.18 3.25L6 10l-2.8 2.8A2 2 0 004 15.19V19a2 2 0 002 2h12a2 2 0 002-2v-3.81a2 2 0 00-.2-2.39L18 10l2.8-2.8A2 2 0 0019.81 4H4.19z" />
  </svg>
);

const AccountIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HelpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// const SaveIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//   </svg>
// );

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para las configuraciones
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    isPrivate: false,
    allowMessages: 'all',
    showEmail: false,
    showPhone: false,
    showBirthDate: false
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    messages: true,
    stories: true,
    posts: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  });

  // Estados para cambiar contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSettings();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await getUserSettings();
      if (response.success) {
        setPrivacySettings(response.settings.privacy);
        setNotificationSettings(response.settings.notifications);
        setSecuritySettings(response.settings.security);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<User>) => {
    try {
      const updatedProfile = await updateUserProfile(updatedData);
      setProfile(updatedProfile);
      setShowEditForm(false);
      showMessage('success', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Error al actualizar el perfil');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Validaciones con Zod para configuraciones
  const privacyValidation = useFormValidation({
    schema: privacySettingsSchema,
    onSubmit: async (data) => {
      await updatePrivacySettings(data);
      showMessage('success', 'Configuración de privacidad guardada');
    }
  });

  const notificationValidation = useFormValidation({
    schema: notificationSettingsSchema,
    onSubmit: async (data) => {
      await updateNotificationSettings(data);
      showMessage('success', 'Configuración de notificaciones guardada');
    }
  });

  const securityValidation = useFormValidation({
    schema: securitySettingsSchema,
    onSubmit: async (data) => {
      await updateSecuritySettings(data);
      showMessage('success', 'Configuración de seguridad guardada');
    }
  });

  // Handlers para guardar configuraciones con validación
  const handleSavePrivacy = useCallback(async () => {
    try {
      setSaving(true);
      await privacyValidation.handleSubmit(privacySettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      showMessage('error', 'Error al guardar la configuración de privacidad');
    } finally {
      setSaving(false);
    }
  }, [privacySettings, privacyValidation, setSaving]);

  const handleSaveNotifications = useCallback(async () => {
    try {
      setSaving(true);
      await notificationValidation.handleSubmit(notificationSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showMessage('error', 'Error al guardar la configuración de notificaciones');
    } finally {
      setSaving(false);
    }
  }, [notificationSettings, notificationValidation, setSaving]);

  const handleSaveSecurity = useCallback(async () => {
    try {
      setSaving(true);
      await securityValidation.handleSubmit(securitySettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
      showMessage('error', 'Error al guardar la configuración de seguridad');
    } finally {
      setSaving(false);
    }
  }, [securitySettings, securityValidation, setSaving]);

  // Validación de cambio de contraseña con Zod
  const passwordValidation = useFormValidation({
    schema: changePasswordSchema,
    onSubmit: async (data) => {
      await changePassword(data.currentPassword, data.newPassword);
      showMessage('success', 'Contraseña cambiada correctamente');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  });

  const handleChangePassword = useCallback(async () => {
    try {
      setSaving(true);
      await passwordValidation.handleSubmit(passwordForm);
    } catch (error) {
      if (error instanceof Error) {
        showMessage('error', error.message || 'Error al cambiar la contraseña');
      } else {
        showMessage('error', 'Error al cambiar la contraseña');
      }
    } finally {
      setSaving(false);
    }
  }, [passwordForm, passwordValidation, setSaving]);

  const handleToggleTwoFactor = async (enabled: boolean) => {
    try {
      setSaving(true);
      await toggleTwoFactor(enabled);
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: enabled }));
      showMessage('success', enabled ? '2FA habilitado' : '2FA deshabilitado');
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      showMessage('error', 'Error al configurar 2FA');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/${user?.username}`} className="text-blue-600 hover:text-blue-800">
                ← Volver al perfil
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <SettingsIcon />
              Configuración
            </h1>
            <p className="text-gray-600 mt-2">Gestiona tu cuenta y preferencias</p>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar de navegación */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveSection('account')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeSection === 'account'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AccountIcon />
                      <span className="font-medium">Cuenta</span>
                    </div>
                    <ArrowIcon />
                  </button>

                  <button
                    onClick={() => setActiveSection('security')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeSection === 'security'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SecurityIcon />
                      <span className="font-medium">Seguridad</span>
                    </div>
                    <ArrowIcon />
                  </button>

                  <button
                    onClick={() => setActiveSection('privacy')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeSection === 'privacy'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PrivacyIcon />
                      <span className="font-medium">Privacidad</span>
                    </div>
                    <ArrowIcon />
                  </button>

                  <button
                    onClick={() => setActiveSection('notifications')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeSection === 'notifications'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <NotificationIcon />
                      <span className="font-medium">Notificaciones</span>
                    </div>
                    <ArrowIcon />
                  </button>

                  <button
                    onClick={() => setActiveSection('help')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeSection === 'help'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpIcon />
                      <span className="font-medium">Ayuda</span>
                    </div>
                    <ArrowIcon />
                  </button>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LogoutIcon />
                        <span className="font-medium">Cerrar sesión</span>
                      </div>
                      <ArrowIcon />
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {activeSection === 'account' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de la cuenta</h2>
                    {profile && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {profile.avatar ? (
                              <Image
                                src={profile.avatar}
                                alt="avatar"
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                                {profile.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{profile.username || 'Usuario'}</h3>
                            <p className="text-gray-600">{profile.email || 'email@ejemplo.com'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowEditForm(true)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Editar perfil
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'security' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Seguridad</h2>
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Cambiar contraseña</h3>
                        <p className="text-gray-600 mb-4">Actualiza tu contraseña para mantener tu cuenta segura</p>
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cambiar contraseña
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Autenticación de dos factores</h3>
                        <p className="text-gray-600 mb-4">Añade una capa extra de seguridad a tu cuenta</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {securitySettings.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                          <button
                            onClick={() => handleToggleTwoFactor(!securitySettings.twoFactorEnabled)}
                            disabled={saving}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              securitySettings.twoFactorEnabled
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {saving ? 'Guardando...' : (securitySettings.twoFactorEnabled ? 'Deshabilitar' : 'Habilitar')}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Notificaciones de seguridad</h3>
                        <p className="text-gray-600 mb-4">Recibe alertas sobre actividad sospechosa</p>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Notificaciones de inicio de sesión</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={securitySettings.loginNotifications}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginNotifications: e.target.checked }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Alertas de actividad sospechosa</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={securitySettings.suspiciousActivityAlerts}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, suspiciousActivityAlerts: e.target.checked }))}
                            />
                          </label>
                        </div>
                        <button
                          onClick={handleSaveSecurity}
                          disabled={saving}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'privacy' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacidad</h2>
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Perfil público</h3>
                        <p className="text-gray-600 mb-4">Controla quién puede ver tu perfil</p>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="profile"
                              className="mr-2"
                              checked={!privacySettings.isPrivate}
                              onChange={() => setPrivacySettings(prev => ({ ...prev, isPrivate: false }))}
                            />
                            <span className="text-gray-700">Público</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="profile"
                              className="mr-2"
                              checked={privacySettings.isPrivate}
                              onChange={() => setPrivacySettings(prev => ({ ...prev, isPrivate: true }))}
                            />
                            <span className="text-gray-700">Privado</span>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Mensajes directos</h3>
                        <p className="text-gray-600 mb-4">Controla quién puede enviarte mensajes</p>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="messages"
                              className="mr-2"
                              checked={privacySettings.allowMessages === 'all'}
                              onChange={() => setPrivacySettings(prev => ({ ...prev, allowMessages: 'all' }))}
                            />
                            <span className="text-gray-700">Todos</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="messages"
                              className="mr-2"
                              checked={privacySettings.allowMessages === 'followers'}
                              onChange={() => setPrivacySettings(prev => ({ ...prev, allowMessages: 'followers' }))}
                            />
                            <span className="text-gray-700">Solo seguidores</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="messages"
                              className="mr-2"
                              checked={privacySettings.allowMessages === 'none'}
                              onChange={() => setPrivacySettings(prev => ({ ...prev, allowMessages: 'none' }))}
                            />
                            <span className="text-gray-700">Nadie</span>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Información personal</h3>
                        <p className="text-gray-600 mb-4">Controla qué información personal es visible</p>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Mostrar email</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={privacySettings.showEmail}
                              onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Mostrar teléfono</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={privacySettings.showPhone}
                              onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Mostrar fecha de nacimiento</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={privacySettings.showBirthDate}
                              onChange={(e) => setPrivacySettings(prev => ({ ...prev, showBirthDate: e.target.checked }))}
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleSavePrivacy}
                        disabled={saving}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : 'Guardar cambios de privacidad'}
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Notificaciones</h2>
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Notificaciones push</h3>
                        <p className="text-gray-600 mb-4">Recibe notificaciones en tiempo real</p>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Nuevos seguidores</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={notificationSettings.follows}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, follows: e.target.checked }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Me gusta y comentarios</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={notificationSettings.likes && notificationSettings.comments}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                likes: e.target.checked,
                                comments: e.target.checked
                              }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Mensajes directos</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={notificationSettings.messages}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, messages: e.target.checked }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Menciones</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={notificationSettings.mentions}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, mentions: e.target.checked }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Nuevas historias</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={notificationSettings.stories}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, stories: e.target.checked }))}
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Nuevas publicaciones</span>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={notificationSettings.posts}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, posts: e.target.checked }))}
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveNotifications}
                        disabled={saving}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : 'Guardar cambios de notificaciones'}
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'help' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ayuda y soporte</h2>
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Centro de ayuda</h3>
                        <p className="text-gray-600 mb-4">Encuentra respuestas a tus preguntas</p>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          Ver ayuda
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Contactar soporte</h3>
                        <p className="text-gray-600 mb-4">¿Necesitas ayuda? Contáctanos</p>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          Contactar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de editar perfil */}
        {showEditForm && profile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <EditProfileForm
                profile={profile}
                onSave={handleProfileUpdate}
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          </div>
        )}

        {/* Modal de cambiar contraseña */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cambiar contraseña</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contraseña actual"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nueva contraseña"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

import { fadeUpVariants, scaleVariants } from '@/lib/motion-config';

import { ProfileEditForm } from '@/modules/profile/components/profile-edit-form';
import { useSession } from '@/hooks/use-session';
import { PasswordChangeForm } from './password-change-form';
import { PrivacySettings } from './privacy-settings';
import { NotificationsSettings } from './notifications-settings';
import { AccountSettings } from './account-settings';
import { AppSettings } from './app-settings';
import { DangerZone } from './danger-zone';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'privacy' | 'app' | 'password' | 'danger';

export function SettingsShell(): ReactElement | null {
  const { user, isHydrated } = useSession();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as SettingsTab | null;
  // Si hay tab en URL, usarlo; si no, empezar en 'account' (vista general de configuración)
  const defaultTab: SettingsTab = 'account';
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabFromUrl && ['profile', 'account', 'notifications', 'privacy', 'app', 'password', 'danger'].includes(tabFromUrl) 
      ? tabFromUrl 
      : defaultTab
  );

  useEffect(() => {
    if (tabFromUrl && ['profile', 'account', 'notifications', 'privacy', 'app', 'password', 'danger'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      // Si no hay tab en URL, volver al default
      setActiveTab(defaultTab);
    }
  }, [tabFromUrl]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-600 dark:text-white/60">
        Cargando configuración…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: ReactElement }> = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )
    },
    {
      id: 'account',
      label: 'Cuenta',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
          />
        </svg>
      )
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      )
    },
    {
      id: 'privacy',
      label: 'Privacidad',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      )
    },
    {
      id: 'app',
      label: 'Aplicación',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      )
    },
    {
      id: 'password',
      label: 'Contraseña',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      )
    },
    {
      id: 'danger',
      label: 'Zona de peligro',
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
    }
  ];

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl"
    >
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar con pestañas */}
        <div className="w-full lg:w-72">
          <nav className="space-y-2 rounded-2xl glass-card p-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white glass-dark'
                  }`}
                >
                  <motion.span
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="rounded-2xl glass-card p-8"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileEditForm 
                    profile={user} 
                    onSuccess={() => {
                      // El componente manejará la redirección automáticamente
                      // Si cambió el handle, redirigirá al nuevo perfil
                      // Si no, redirigirá al perfil actual
                    }}
                  />
                </motion.div>
              )}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AccountSettings />
                </motion.div>
              )}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <NotificationsSettings />
                </motion.div>
              )}
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PrivacySettings />
                </motion.div>
              )}
              {activeTab === 'app' && (
                <motion.div
                  key="app"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AppSettings />
                </motion.div>
              )}
              {activeTab === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PasswordChangeForm />
                </motion.div>
              )}
              {activeTab === 'danger' && (
                <motion.div
                  key="danger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DangerZone />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


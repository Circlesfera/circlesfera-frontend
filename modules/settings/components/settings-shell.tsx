'use client';

import { useState, type ReactElement } from 'react';

import { ProfileEditForm } from '@/modules/profile/components/profile-edit-form';
import { useSession } from '@/hooks/use-session';
import { PasswordChangeForm } from './password-change-form';
import { PrivacySettings } from './privacy-settings';
import { DangerZone } from './danger-zone';

type SettingsTab = 'profile' | 'password' | 'privacy' | 'danger';

export function SettingsShell(): ReactElement | null {
  const { user, isHydrated } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (!isHydrated) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-white/60">
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
    <div className="w-full max-w-6xl">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar con pestañas */}
        <div className="w-full lg:w-64">
          <nav className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="flex-1">
          <div className="rounded-3xl bg-slate-900/60 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,1)]">
            {activeTab === 'profile' && <ProfileEditForm profile={user} />}
            {activeTab === 'password' && <PasswordChangeForm />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'danger' && <DangerZone />}
          </div>
        </div>
      </div>
    </div>
  );
}


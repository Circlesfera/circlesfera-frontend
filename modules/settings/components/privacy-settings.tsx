'use client';

import { type ReactElement } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { getPreferences, updatePreferences, type UpdatePreferencesPayload } from '@/services/api/preferences';
import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';

export function PrivacySettings(): ReactElement {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: getPreferences
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdatePreferencesPayload) => updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast.success('Preferencias actualizadas');
    },
    onError: () => {
      toast.error('No se pudieron actualizar las preferencias');
    }
  });

  const preferences = data?.preferences;

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const handleToggle = (field: keyof UpdatePreferencesPayload, value: boolean): void => {
    updateMutation.mutate({ [field]: value } as UpdatePreferencesPayload);
  };

  const handleSelectChange = (
    field: 'whoCanComment' | 'whoCanMention',
    value: 'everyone' | 'followers' | 'nobody'
  ): void => {
    updateMutation.mutate({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-gradient-primary text-2xl font-bold md:text-3xl">
          Privacidad
        </h2>
        <p className="mt-2 text-sm text-slate-400">Controla quién puede ver tu contenido y cómo interactúan contigo</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Cuenta privada */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <svg className="size-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Cuenta privada</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Solo las personas que apruebes podrán ver tus publicaciones y seguirte
                  </p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.isPrivate ?? false}
                onChange={(e) => {
                  handleToggle('isPrivate', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Actividad de estado */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <svg className="size-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Actividad de estado</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Muestra cuándo estuviste activo por última vez a otros usuarios
                  </p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.showActivityStatus ?? true}
                onChange={(e) => {
                  handleToggle('showActivityStatus', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Quién puede comentar */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl glass-card p-6"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Quién puede comentar</h3>
            <p className="text-sm text-slate-400">Controla quién puede comentar en tus publicaciones</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['everyone', 'followers', 'nobody'] as const).map((option) => {
              const isSelected = preferences?.whoCanComment === option;
              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => {
                    handleSelectChange('whoCanComment', option);
                  }}
                  disabled={updateMutation.isPending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl border-2 p-3 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent text-white shadow-lg shadow-primary-500/30'
                      : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {option === 'everyone' ? 'Todos' : option === 'followers' ? 'Seguidores' : 'Nadie'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Quién puede mencionar */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl glass-card p-6"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Quién puede mencionarte</h3>
            <p className="text-sm text-slate-400">Controla quién puede mencionarte en comentarios y publicaciones</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['everyone', 'followers', 'nobody'] as const).map((option) => {
              const isSelected = preferences?.whoCanMention === option;
              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => {
                    handleSelectChange('whoCanMention', option);
                  }}
                  disabled={updateMutation.isPending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl border-2 p-3 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent text-white shadow-lg shadow-primary-500/30'
                      : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {option === 'everyone' ? 'Todos' : option === 'followers' ? 'Seguidores' : 'Nadie'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


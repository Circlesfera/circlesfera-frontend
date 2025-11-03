'use client';

import { type ReactElement } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { getPreferences, updatePreferences, type UpdatePreferencesPayload } from '@/services/api/preferences';
import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';

export function AppSettings(): ReactElement {
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
      // Recargar página para aplicar tema
      if (updateMutation.variables?.theme) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
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

  return (
    <div className="space-y-8">
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-gradient-primary text-2xl font-bold md:text-3xl">
          Aplicación
        </h2>
        <p className="mt-2 text-sm text-slate-400">Personaliza tu experiencia</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Tema */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl glass-card p-6"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Tema</h3>
            <p className="text-sm text-slate-400">Elige tu tema preferido</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(['light', 'dark', 'system'] as const).map((theme) => {
              const isSelected = preferences?.theme === theme;
              return (
                <motion.button
                  key={theme}
                  type="button"
                  onClick={() => {
                    updateMutation.mutate({ theme });
                  }}
                  disabled={updateMutation.isPending}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent shadow-lg shadow-primary-500/30'
                      : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`size-10 rounded-lg shadow-md ${
                        theme === 'light'
                          ? 'bg-white'
                          : theme === 'dark'
                            ? 'bg-slate-800'
                            : 'bg-gradient-to-br from-white to-slate-800'
                      }`}
                    />
                    <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Idioma */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl glass-card p-6"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-2">Idioma</h3>
            <p className="text-sm text-slate-400">Elige tu idioma preferido</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(['es', 'en'] as const).map((lang) => {
              const isSelected = preferences?.language === lang;
              return (
                <motion.button
                  key={lang}
                  type="button"
                  onClick={() => {
                    updateMutation.mutate({ language: lang });
                  }}
                  disabled={updateMutation.isPending}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                      : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {lang === 'es' ? 'Español' : 'English'}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


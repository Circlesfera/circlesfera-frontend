'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { type ReactElement } from 'react';
import { toast } from 'sonner';

import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { getPreferences, updatePreferences, type UpdatePreferencesPayload } from '@/services/api/preferences';

export function AppSettings(): ReactElement {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: getPreferences
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdatePreferencesPayload) => updatePreferences(payload),
    onMutate: (payload) => {
      // Actualización optimista del tema en localStorage para aplicación inmediata
      if (payload.theme) {
        try {
          localStorage.setItem('theme', payload.theme);
          // Aplicar tema inmediatamente
          const root = document.documentElement;
          const effectiveTheme = payload.theme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : payload.theme;
          
          if (effectiveTheme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
          } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
          }
        } catch {
          // Ignorar errores de localStorage
        }
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast.success('Preferencias actualizadas');
      // El ThemeProvider se encargará de sincronizar el tema con el servidor
    },
    onError: (error, variables) => {
      console.error('Error al actualizar preferencias:', error);
      toast.error('No se pudieron actualizar las preferencias');
      // Revertir tema en localStorage si falla
      if (variables.theme) {
        try {
          const currentData = queryClient.getQueryData<{ preferences?: { theme?: 'light' | 'dark' | 'system' } }>(['preferences']);
          const currentTheme = currentData?.preferences?.theme || 'dark';
          localStorage.setItem('theme', currentTheme);
          // Revertir visualmente
          const root = document.documentElement;
          const effectiveTheme = currentTheme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : (currentTheme);
          
          if (effectiveTheme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
          } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
          }
        } catch {
          // Ignorar errores
        }
      }
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
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Personaliza tu experiencia</p>
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
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tema</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Elige tu tema preferido</p>
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
                      ? 'border-primary-500 bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent shadow-lg shadow-primary-500/30 text-white dark:border-primary-500 dark:bg-gradient-to-r dark:from-primary-500/20 dark:via-primary-500/15 dark:to-transparent dark:shadow-lg dark:shadow-primary-500/30 dark:text-white'
                      : 'border-slate-200/20 bg-white/50 hover:border-slate-300/30 hover:bg-slate-50/80 dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-white/20 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`size-10 rounded-lg shadow-md ${
                        theme === 'light'
                          ? 'bg-white dark:bg-white'
                          : theme === 'dark'
                            ? 'bg-slate-800 dark:bg-slate-800'
                            : 'bg-gradient-to-br from-white to-slate-800 dark:from-white dark:to-slate-800'
                      }`}
                    />
                    <span className={`text-xs font-semibold ${
                      isSelected 
                        ? 'text-slate-900 dark:text-white' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
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
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Idioma</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Elige tu idioma preferido</p>
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
                      ? 'border-primary-500 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 dark:border-primary-500 dark:bg-gradient-to-r dark:from-primary-600 dark:via-primary-500 dark:to-accent-500 dark:text-white dark:shadow-lg dark:shadow-primary-500/30'
                      : 'border-slate-200/20 bg-white/50 hover:border-slate-300/30 hover:bg-slate-50/80 text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-white/20 dark:hover:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
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


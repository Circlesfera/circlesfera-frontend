'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { type ReactElement } from 'react';
import { toast } from 'sonner';

import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { getPreferences, updatePreferences, type UpdatePreferencesPayload } from '@/services/api/preferences';

export function NotificationsSettings(): ReactElement {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: getPreferences
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdatePreferencesPayload) => updatePreferences(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['preferences'] });
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

  return (
    <div className="space-y-8">
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-gradient-primary text-2xl font-bold md:text-3xl">
          Notificaciones
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Controla qué notificaciones recibes</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Likes */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <svg className="size-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Likes</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recibe notificaciones cuando alguien da like a tus publicaciones</p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.notificationsLikes ?? true}
                onChange={(e) => {
                  handleToggle('notificationsLikes', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Comentarios */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="size-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Comentarios</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recibe notificaciones cuando alguien comenta en tus publicaciones</p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.notificationsComments ?? true}
                onChange={(e) => {
                  handleToggle('notificationsComments', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Seguidores */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg className="size-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Seguimientos</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recibe notificaciones cuando alguien te sigue</p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.notificationsFollows ?? true}
                onChange={(e) => {
                  handleToggle('notificationsFollows', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Menciones */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <svg className="size-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Menciones</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recibe notificaciones cuando alguien te menciona</p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.notificationsMentions ?? true}
                onChange={(e) => {
                  handleToggle('notificationsMentions', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Respuestas */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <svg className="size-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Respuestas</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recibe notificaciones cuando alguien responde a tus comentarios</p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.notificationsReplies ?? true}
                onChange={(e) => {
                  handleToggle('notificationsReplies', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Etiquetas */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <svg className="size-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Etiquetas</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recibe notificaciones cuando alguien te etiqueta en una foto</p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.notificationsTags ?? true}
                onChange={(e) => {
                  handleToggle('notificationsTags', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Compartidos */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.01, x: 4 }}
          className="rounded-2xl glass-card p-6 transition-all hover:shadow-elegant-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <svg className="size-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342c-.400 0-.816-.039-1.236-.115l-.866-2.322c-.35-.937.062-1.954.938-2.305l2.322-.866c.402-.15.81-.231 1.221-.231.4 0 .816.039 1.236.115l.866 2.322c.35.937-.062 1.954-.938 2.305l-2.322.866c-.402.15-.81.231-1.221.231zM13.342 8.684c.4 0 .816-.039 1.236-.115l.866-2.322c.35-.937-.062-1.954-.938-2.305l-2.322-.866c-.402-.15-.81-.231-1.221-.231-.4 0-.816.039-1.236.115l-.866 2.322c-.35.937.062 1.954.938 2.305l2.322.866c.402.15.81.231 1.221.231z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Compartidos</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recibe notificaciones cuando alguien comparte tu publicación</p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences?.notificationsShares ?? true}
                onChange={(e) => {
                  handleToggle('notificationsShares', e.target.checked);
                }}
                disabled={updateMutation.isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
            </label>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


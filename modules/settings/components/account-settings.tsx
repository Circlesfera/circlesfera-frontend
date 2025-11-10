'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { type ReactElement, useState } from 'react';
import { toast } from 'sonner';

import { useSession } from '@/hooks/use-session';
import { fadeUpVariants, staggerContainer, staggerItem } from '@/lib/motion-config';
import { VerificationRequestDialog } from '@/modules/verification/components/verification-request-dialog';
import { updateProfile } from '@/services/api/users';
import { getMyVerificationRequest } from '@/services/api/verification';
import { useSessionStore } from '@/store/session';

export function AccountSettings(): ReactElement {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [newHandle, setNewHandle] = useState(user?.handle ?? '');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  // Obtener estado de solicitud de verificación
  const { data: verificationData } = useQuery({
    queryKey: ['verification', 'request'],
    queryFn: getMyVerificationRequest,
    enabled: !!user && !user.isVerified,
    staleTime: 1000 * 60 * 5
  });

  const verificationRequest = verificationData?.request;

  const updateHandleMutation = useMutation({
    mutationFn: async (trimmedHandle: string) => updateProfile({ handle: trimmedHandle }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['profile', updated.handle] });
      useSessionStore.getState().updateUser(updated);
      toast.success('Nombre de usuario actualizado correctamente');
      setIsEditingHandle(false);

      if (updated.handle !== user?.handle) {
        router.push(`/${updated.handle}`);
        setTimeout(() => {
          router.push('/settings?tab=account');
        }, 1000);
      } else {
        router.refresh();
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
      const code = axiosError.response?.data?.code;

      if (code === 'HANDLE_ALREADY_EXISTS') {
        toast.error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
      } else {
        toast.error(axiosError.response?.data?.message || 'No se pudo actualizar el nombre de usuario');
      }
    }
  });

  const handleSaveHandle = (): void => {
    if (!user || !newHandle.trim()) return;

    const trimmedHandle = newHandle.trim().toLowerCase();
    
    if (trimmedHandle === user.handle) {
      setIsEditingHandle(false);
      return;
    }

    if (trimmedHandle.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(trimmedHandle)) {
      toast.error('Solo letras minúsculas, números y guiones bajos');
      return;
    }

    updateHandleMutation.mutate(trimmedHandle);
  };

  return (
    <div className="space-y-8">
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-gradient-primary text-2xl font-bold md:text-3xl">
          Cuenta
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Gestiona tu información de cuenta</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Email */}
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Correo electrónico</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                Verificado
              </span>
            </div>
          </div>
        </motion.div>

        {/* Handle */}
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
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Usuario</h3>
                  {isEditingHandle ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-medium pointer-events-none z-10 select-none leading-none text-base">
                          @
                        </span>
                        <input
                          type="text"
                          value={newHandle}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase();
                            setNewHandle(value);
                          }}
                          placeholder="usuario"
                          maxLength={30}
                          className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 pr-4 py-3 pl-[2.75rem] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500/70 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40 transition-all duration-300"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveHandle}
                          disabled={updateHandleMutation.isPending || newHandle.trim() === user?.handle}
                          className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateHandleMutation.isPending ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingHandle(false);
                            setNewHandle(user?.handle ?? '');
                          }}
                          disabled={updateHandleMutation.isPending}
                          className="rounded-xl glass-dark px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Solo letras minúsculas, números y guiones bajos. Entre 3 y 30 caracteres.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">@{user?.handle}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingHandle(true);
                          setNewHandle(user?.handle ?? '');
                        }}
                        className="mt-2 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Editar nombre de usuario
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!isEditingHandle && (
              <div className="ml-4">
                <span className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-semibold border border-primary-500/30">
                  Editable
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Verificación */}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Verificación</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {user?.isVerified
                      ? 'Tu cuenta está verificada'
                      : verificationRequest?.status === 'pending'
                        ? 'Solicitud en revisión'
                        : verificationRequest?.status === 'approved'
                          ? 'Solicitud aprobada'
                          : verificationRequest?.status === 'rejected'
                            ? 'Solicitud rechazada'
                      : 'Solicita la verificación de tu cuenta'}
                  </p>
                  {verificationRequest?.status === 'pending' && (
                    <p className="mt-2 text-xs text-slate-500">
                      Enviada el {new Date(verificationRequest.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                    </p>
                  )}
                  {verificationRequest?.status === 'rejected' && verificationRequest.reviewNotes && (
                    <p className="mt-2 text-xs text-red-400">
                      {verificationRequest.reviewNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="ml-4 flex flex-col items-end gap-2">
              {user?.isVerified ? (
                <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                  Verificado
                </span>
              ) : verificationRequest?.status === 'pending' ? (
                <span className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/30">
                  Pendiente
                </span>
              ) : verificationRequest?.status === 'approved' ? (
                <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                  Aprobada
                </span>
              ) : verificationRequest?.status === 'rejected' ? (
                <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                  Rechazada
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-xs font-semibold border border-slate-300 dark:border-slate-600/30">
                  No verificado
                </span>
              )}
              {!user?.isVerified && (
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationDialog(true);
                  }}
                  className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={verificationRequest?.status === 'pending'}
                >
                  {verificationRequest?.status === 'pending'
                    ? 'En revisión'
                    : verificationRequest?.status === 'rejected'
                      ? 'Nueva solicitud'
                      : 'Solicitar verificación'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Diálogo de solicitud de verificación */}
        {showVerificationDialog && (
          <VerificationRequestDialog
            onClose={() => {
              setShowVerificationDialog(false);
            }}
            onSuccess={() => {
              setShowVerificationDialog(false);
            }}
          />
        )}

        {/* Miembro desde */}
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Miembro desde</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Fecha no disponible'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


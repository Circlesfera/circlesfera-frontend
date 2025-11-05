'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { deleteAccount } from '@/services/api/users';
import { useSessionStore } from '@/store/session';
import { fadeUpVariants } from '@/lib/motion-config';

export function DangerZone(): ReactElement {
  const router = useRouter();
  const clearSession = useSessionStore((state) => state.clearSession);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const handleDeleteAccount = async (): Promise<void> => {
    if (confirmation.toLowerCase() !== 'eliminar') {
      toast.error('Por favor, escribe "ELIMINAR" para confirmar');
      return;
    }

    if (!confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Cuenta eliminada exitosamente');
      clearSession();
      router.push('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la cuenta';
      toast.error(message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold md:text-3xl bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
          Zona de peligro
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Acciones irreversibles. Ten cuidado antes de proceder.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl glass-card border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-900/10 to-red-900/20 p-8 shadow-lg shadow-red-500/10"
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <svg className="size-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-red-400 text-lg">Eliminar cuenta</h3>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                Esta acción es permanente y no se puede deshacer
              </p>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Al eliminar tu cuenta, se borrarán permanentemente:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1.5 ml-4">
              <li>Todos tus datos y configuraciones</li>
              <li>Todas tus publicaciones y contenido</li>
              <li>Todos tus seguidores y seguidos</li>
              <li>Todas tus conversaciones y mensajes</li>
              <li>Todas tus notificaciones y actividad</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 border-t border-red-500/20 pt-6">
          <div>
            <label htmlFor="confirmation" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Escribe <span className="font-bold text-red-400">ELIMINAR</span> para confirmar:
            </label>
            <input
              id="confirmation"
              type="text"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
              }}
              placeholder="ELIMINAR"
              className="w-full rounded-xl glass-card border-red-500/50 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-red-400/50 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200"
            />
          </div>

          <motion.button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmation.toLowerCase() !== 'eliminar'}
            whileHover={{ scale: confirmation.toLowerCase() === 'eliminar' ? 1.02 : 1 }}
            whileTap={{ scale: confirmation.toLowerCase() === 'eliminar' ? 0.98 : 1 }}
            className="w-full rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Eliminando cuenta...
              </span>
            ) : (
              'Eliminar cuenta permanentemente'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}


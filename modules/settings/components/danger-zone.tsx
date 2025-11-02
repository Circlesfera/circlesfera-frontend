'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteAccount } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-red-400">Zona de peligro</h2>
        <p className="mt-2 text-sm text-slate-400">
          Acciones irreversibles. Ten cuidado antes de proceder.
        </p>
      </div>

      <div className="rounded-xl border-2 border-red-500/30 bg-red-500/10 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-red-400">Eliminar cuenta</h3>
          <p className="mt-2 text-sm text-slate-300">
            Al eliminar tu cuenta, se borrarán permanentemente todos tus datos, publicaciones, seguidores y
            seguidos. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="confirmation" className="block text-sm font-medium text-slate-300 mb-2">
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
              className="w-full rounded-xl border border-red-500/50 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-red-400/50 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmation.toLowerCase() !== 'eliminar'}
            className="rounded-xl border border-red-500 bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando cuenta...' : 'Eliminar cuenta permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
}


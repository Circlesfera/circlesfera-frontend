'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormEvent , type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { logger } from '@/lib/logger';

import { createVerificationRequest, type CreateVerificationRequestPayload } from '../../../services/api/verification';

interface VerificationRequestDialogProps {
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export function VerificationRequestDialog({ onClose, onSuccess }: VerificationRequestDialogProps): ReactElement {
  const queryClient = useQueryClient();
  const [justification, setJustification] = useState('');
  const [documentsUrl, setDocumentsUrl] = useState('');

  const createMutation = useMutation({
    mutationFn: async (payload: CreateVerificationRequestPayload) => createVerificationRequest(payload),
    onSuccess: () => {
      toast.success('Solicitud de verificación enviada');
      void queryClient.invalidateQueries({ queryKey: ['verification', 'request'] });
      onSuccess();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'No se pudo crear la solicitud de verificación';
      toast.error(message);
      logger.error('Error al crear solicitud de verificación', error);
    }
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!justification.trim() && !documentsUrl.trim()) {
      toast.error('Proporciona una justificación o URL de documentos');
      return;
    }

    createMutation.mutate({
      justification: justification.trim() || undefined,
      documentsUrl: documentsUrl.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">Solicitar verificación de cuenta</h2>
        <p className="mb-6 text-sm text-slate-400">
          La verificación ayuda a confirmar la autenticidad de tu cuenta. Proporciona información sobre por qué deberías
          ser verificado.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="justification" className="mb-1 block text-sm font-medium text-slate-300">
              Justificación <span className="text-slate-500">(opcional)</span>
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
              }}
              maxLength={500}
              placeholder="Explica por qué deberías ser verificado..."
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">{justification.length}/500 caracteres</p>
          </div>

          <div>
            <label htmlFor="documents-url" className="mb-1 block text-sm font-medium text-slate-300">
              URL de documentos <span className="text-slate-500">(opcional)</span>
            </label>
            <input
              id="documents-url"
              type="url"
              value={documentsUrl}
              onChange={(e) => {
                setDocumentsUrl(e.target.value);
              }}
              placeholder="https://ejemplo.com/documento.pdf"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">Enlace a documentos que prueben tu identidad</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="rounded-xl border border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || (!justification.trim() && !documentsUrl.trim())}
              className="rounded-xl bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


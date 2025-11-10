'use client';

import { useMutation } from '@tanstack/react-query';
import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { createHighlight, type CreateHighlightPayload } from '../../../services/api/highlights';

interface CreateHighlightDialogProps {
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export function CreateHighlightDialog({ onClose, onSuccess }: CreateHighlightDialogProps): ReactElement {
  const [name, setName] = useState('');

  const createMutation = useMutation({
    mutationFn: (payload: CreateHighlightPayload) => createHighlight(payload),
    onSuccess: () => {
      toast.success('Highlight creado');
      onSuccess();
    },
    onError: () => {
      toast.error('No se pudo crear el highlight');
    }
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    createMutation.mutate({ name: name.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Crear nuevo highlight</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="highlight-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nombre del highlight
            </label>
            <input
              id="highlight-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
              maxLength={50}
              placeholder="Ej: Vacaciones, Recetas..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Agrega stories después de crear el highlight</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="rounded-xl bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


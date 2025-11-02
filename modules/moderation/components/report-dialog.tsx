'use client';

import { useState, type ReactElement } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createReport, type ReportTargetType, type ReportReason } from '@/services/api/reports';

interface ReportDialogProps {
  readonly targetType: ReportTargetType;
  readonly targetId: string;
  readonly targetName?: string;
  readonly onClose: () => void;
}

const REASONS: Array<{ value: ReportReason; label: string; description: string }> = [
  { value: 'spam', label: 'Spam', description: 'Contenido no deseado o repetitivo' },
  { value: 'harassment', label: 'Acoso', description: 'Comportamiento abusivo o intimidatorio' },
  { value: 'inappropriate', label: 'Contenido inapropiado', description: 'Contenido que viola nuestras normas' },
  { value: 'violence', label: 'Violencia', description: 'Amenazas o contenido violento' },
  { value: 'copyright', label: 'Derechos de autor', description: 'Violación de propiedad intelectual' },
  { value: 'false_information', label: 'Información falsa', description: 'Desinformación o noticias falsas' },
  { value: 'other', label: 'Otro', description: 'Otra razón no mencionada' }
];

export function ReportDialog({ targetType, targetId, targetName, onClose }: ReportDialogProps): ReactElement {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  const reportMutation = useMutation({
    mutationFn: (payload: { reason: ReportReason; details?: string }) =>
      createReport({
        targetType,
        targetId,
        ...payload
      }),
    onSuccess: () => {
      toast.success('Reporte enviado. Gracias por ayudarnos a mantener CircleSfera seguro.');
      onClose();
    },
    onError: (error: Error) => {
      const message = error.message || 'No se pudo enviar el reporte';
      toast.error(message);
    }
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error('Selecciona una razón para el reporte');
      return;
    }

    reportMutation.mutate({
      reason: selectedReason,
      details: details.trim() || undefined
    });
  };

  const getTargetLabel = (): string => {
    switch (targetType) {
      case 'post':
        return 'publicación';
      case 'comment':
        return 'comentario';
      case 'user':
        return 'usuario';
      default:
        return 'contenido';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Reportar {getTargetLabel()}</h2>
          {targetName && <p className="mt-2 text-sm text-slate-400">{targetName}</p>}
          <p className="mt-1 text-sm text-slate-500">
            Tu reporte es anónimo y será revisado por nuestro equipo de moderación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Razón del reporte</label>
            <div className="space-y-2">
              {REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    selectedReason === reason.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => {
                      setSelectedReason(reason.value);
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{reason.label}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedReason && (
            <div>
              <label htmlFor="details" className="mb-2 block text-sm font-medium text-white">
                Detalles adicionales (opcional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                }}
                placeholder="Proporciona más información que nos ayude a entender el problema..."
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <div className="mt-1 text-xs text-slate-500">{details.length} / 500</div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={reportMutation.isPending}
              className="rounded-xl border border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedReason || reportMutation.isPending}
              className="rounded-xl bg-red-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reportMutation.isPending ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactElement, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import { createReport, type ReportReason,type ReportTargetType } from '@/services/api/reports';

interface ReportDialogProps {
  readonly targetType: ReportTargetType;
  readonly targetId: string;
  readonly targetName?: string;
  readonly onClose: () => void;
}

const REASONS: Array<{ value: ReportReason; label: string; description: string; icon: ReactElement }> = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Contenido no deseado o repetitivo',
    icon: IconBubble('M4 6h16M4 12h10M4 18h7')
  },
  {
    value: 'harassment',
    label: 'Acoso',
    description: 'Comportamiento abusivo o intimidatorio',
    icon: IconBubble('M12 8c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3z M5 21v-2a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v2')
  },
  {
    value: 'inappropriate',
    label: 'Contenido inapropiado',
    description: 'Contenido que viola nuestras normas',
    icon: IconBubble('M12 5v14M5 12h14')
  },
  {
    value: 'violence',
    label: 'Violencia',
    description: 'Amenazas o contenido violento',
    icon: IconBubble('M12 2l7 7-7 13-7-13 7-7z')
  },
  {
    value: 'copyright',
    label: 'Derechos de autor',
    description: 'Violación de propiedad intelectual',
    icon: IconBubble('M12 8a4 4 0 1 0 0 8 2 2 0 0 0 0-4')
  },
  {
    value: 'false_information',
    label: 'Información falsa',
    description: 'Desinformación o noticias falsas',
    icon: IconBubble('M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 6v4m0 4h.01')
  },
  {
    value: 'other',
    label: 'Otro',
    description: 'Otra razón no mencionada',
    icon: IconBubble('M12 6a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6zm0 10a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 12 16z')
  }
];

export function ReportDialog({ targetType, targetId, targetName, onClose }: ReportDialogProps): ReactElement | null {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const targetLabel = getTargetLabel();
  const headerCopy = `Reportar ${targetLabel}${targetName ? ` para ${targetName}` : ''}`;

  if (!isClient) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex w-full max-w-lg max-h-[80vh] flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/95 p-4 md:p-5 shadow-[0_40px_80px_-35px_rgba(15,23,42,0.75)]"
          role="dialog"
          aria-modal="true"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.15),transparent_60%)]" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-white">{headerCopy}</h2>
              <p className="max-w-md text-xs md:text-sm text-white/65">
                Tu reporte es anónimo. Nuestro equipo de moderación lo revisará en pocas horas. Aporta los detalles necesarios para agilizar la revisión.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-white/30 hover:text-white"
              aria-label="Cerrar"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative mt-4 flex flex-1 flex-col overflow-hidden">
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-md">
                <fieldset>
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/70">Razón del reporte</legend>
                  <div className="grid gap-3">
                    {REASONS.map((reason) => {
                      const isActive = selectedReason === reason.value;
                      return (
                        <label
                          key={reason.value}
                          className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition
                            ${
                              isActive
                                ? 'border-primary-400/80 bg-primary-500/10 shadow-[0_8px_30px_-12px_rgba(99,102,241,0.4)]'
                                : 'border-white/10 bg-white/[0.04] hover:border-white/25'
                            }`}
                        >
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition ${
                              isActive
                                ? 'border-primary-400 bg-primary-500/15 text-primary-100'
                                : 'border-white/10 bg-white/[0.05] text-white/60 group-hover:text-white/80'
                            }`}
                          >
                            {reason.icon}
                          </span>
                          <span className="flex-1">
                            <span className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{reason.label}</span>
                              {isActive && (
                                <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-100">
                                  Seleccionado
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-xs text-white/60">{reason.description}</span>
                          </span>
                          <input
                            type="radio"
                            name="reason"
                            value={reason.value}
                            checked={isActive}
                            onChange={() => {
                              setSelectedReason(reason.value);
                            }}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`absolute right-4 top-1/2 size-4 -translate-y-1/2 rounded-full border-2 transition ${
                              isActive ? 'border-primary-300 bg-primary-400/60' : 'border-white/25'
                            }`}
                          />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <AnimatePresence>
                  {selectedReason && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                    >
                      <label htmlFor="details" className="mb-2 block text-sm font-semibold text-white/80">
                        Detalles adicionales (opcional)
                      </label>
                      <textarea
                        id="details"
                        value={details}
                        onChange={(e) => {
                          setDetails(e.target.value);
                        }}
                        placeholder="Cuéntanos qué sucedió. Links, timestamps o contexto adicional nos ayudan a responder más rápido."
                        rows={4}
                        maxLength={500}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                      />
                      <div className="mt-1 text-right text-xs text-white/40">{details.length} / 500</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={reportMutation.isPending}
                  className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedReason || reportMutation.isPending}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:shadow-xl hover:shadow-rose-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reportMutation.isPending ? (
                    <>
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar reporte'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function IconBubble(path: string): ReactElement {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

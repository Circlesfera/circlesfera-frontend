'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { VerifiedBadge } from '@/components/verified-badge';

import {
  getPendingVerificationRequests,
  reviewVerificationRequest,
  type VerificationRequest
} from '../../../services/api/verification';

interface ReviewDialogProps {
  readonly request: VerificationRequest;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

function ReviewDialog({ request, onClose, onSuccess }: ReviewDialogProps): ReactElement {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');

  const reviewMutation = useMutation({
    mutationFn: (payload: { status: 'approved' | 'rejected'; reviewNotes?: string }) =>
      reviewVerificationRequest(request.id, payload),
    onSuccess: () => {
      toast.success(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verification', 'pending'] });
      onSuccess();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'No se pudo procesar la solicitud';
      toast.error(message);
    }
  });

  const handleSubmit = (): void => {
    reviewMutation.mutate({
      status,
      reviewNotes: reviewNotes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">Revisar Solicitud de Verificación</h2>

        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/40 p-4">
            <div className="relative size-12 overflow-hidden rounded-full">
              <Image
                src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${request.userHandle}`}
                alt={request.userDisplayName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{request.userDisplayName}</p>
              <p className="text-sm text-slate-400">@{request.userHandle}</p>
            </div>
          </div>

          {request.justification && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">Justificación:</p>
              <p className="text-sm text-slate-300">{request.justification}</p>
            </div>
          )}

          {request.documentsUrl && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">Documentos:</p>
              <a
                href={request.documentsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-400 hover:underline"
              >
                {request.documentsUrl}
              </a>
            </div>
          )}

          <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
            <p className="mb-2 text-xs font-medium text-slate-500">Enviada:</p>
            <p className="text-sm text-slate-300">
              {new Date(request.createdAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Decisión</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setStatus('approved');
                }}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                  status === 'approved'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                Aprobar
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus('rejected');
                }}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                  status === 'rejected'
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                Rechazar
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="review-notes" className="mb-2 block text-sm font-medium text-slate-300">
              Notas de revisión <span className="text-slate-500">(opcional)</span>
            </label>
            <textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => {
                setReviewNotes(e.target.value);
              }}
              maxLength={500}
              placeholder="Agrega notas sobre tu decisión..."
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">{reviewNotes.length}/500 caracteres</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={reviewMutation.isPending}
            className="rounded-xl border border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={reviewMutation.isPending}
            className={`rounded-xl px-6 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              status === 'approved'
                ? 'bg-green-500 hover:bg-green-400'
                : 'bg-red-500 hover:bg-red-400'
            }`}
          >
            {reviewMutation.isPending
              ? 'Procesando...'
              : status === 'approved'
                ? 'Aprobar Solicitud'
                : 'Rechazar Solicitud'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminVerificationShell(): ReactElement {
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'verification', 'pending'],
    queryFn: () => getPendingVerificationRequests({ limit: 50 }),
    staleTime: 1000 * 60 * 2 // 2 minutos
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-8 text-center">
        <p className="text-red-400">Error al cargar solicitudes</p>
        <p className="mt-2 text-sm text-slate-400">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    );
  }

  const requests = data?.requests ?? [];

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <VerifiedBadge size="lg" className="mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold text-white">No hay solicitudes pendientes</p>
        <p className="mt-2 text-sm text-slate-400">Todas las solicitudes han sido procesadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Solicitudes Pendientes</h2>
          <span className="rounded-full bg-primary-500/20 px-3 py-1 text-sm font-medium text-primary-400">
            {requests.length}
          </span>
        </div>

        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800/40 p-4 transition hover:border-slate-600"
            >
              <Link href={`/${request.userHandle}`} className="relative size-12 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${request.userHandle}`}
                  alt={request.userDisplayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${request.userHandle}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {request.userDisplayName}
                  </Link>
                  <VerifiedBadge size="sm" className="opacity-50" />
                </div>
                <p className="text-sm text-slate-400">@{request.userHandle}</p>
                {request.justification && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{request.justification}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(request.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(request);
                }}
                className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400"
              >
                Revisar
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedRequest && (
        <ReviewDialog
          request={selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}


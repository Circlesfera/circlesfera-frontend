'use client';

import { useState, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getMyVerificationRequest } from '../../../services/api/verification';
import { useSessionStore } from '@/store/session';
import { VerificationRequestDialog } from './verification-request-dialog';
import { VerifiedBadge } from '@/components/verified-badge';

export function VerificationShell(): ReactElement {
  const currentUser = useSessionStore((state) => state.user);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['verification', 'request'],
    queryFn: getMyVerificationRequest,
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5
  });

  const request = data?.request;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="h-32 animate-pulse rounded bg-slate-800" />
      </div>
    );
  }

  // Usuario ya verificado
  if (currentUser?.isVerified) {
    return (
      <div className="rounded-xl border border-blue-500/50 bg-blue-500/10 p-8 text-center">
        <div className="mb-4 flex justify-center">
          <VerifiedBadge size="lg" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Tu cuenta está verificada</h2>
        <p className="text-sm text-slate-400">
          Felicidades, tu cuenta tiene el badge azul de verificación. Esto ayuda a los usuarios a identificar cuentas
          auténticas.
        </p>
      </div>
    );
  }

  // Solicitud aprobada (pero aún no reflejada en el usuario)
  if (request?.status === 'approved') {
    return (
      <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-white">Solicitud aprobada</h2>
        <p className="mb-4 text-sm text-slate-400">
          Tu solicitud de verificación ha sido aprobada. El badge azul aparecerá en tu cuenta próximamente.
        </p>
        {request.reviewNotes && (
          <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/40 p-4 text-left">
            <p className="text-xs text-slate-500">Notas del administrador:</p>
            <p className="mt-1 text-sm text-slate-300">{request.reviewNotes}</p>
          </div>
        )}
      </div>
    );
  }

  // Solicitud rechazada
  if (request?.status === 'rejected') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">Solicitud rechazada</h2>
          <p className="mb-4 text-sm text-slate-400">
            Tu solicitud de verificación fue rechazada. Puedes enviar una nueva solicitud.
          </p>
          {request.reviewNotes && (
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/40 p-4 text-left">
              <p className="text-xs text-slate-500">Razón:</p>
              <p className="mt-1 text-sm text-slate-300">{request.reviewNotes}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setShowRequestDialog(true);
          }}
          className="w-full rounded-xl bg-primary-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-400"
        >
          Enviar nueva solicitud
        </button>
      </div>
    );
  }

  // Solicitud pendiente
  if (request?.status === 'pending') {
    return (
      <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-white">Solicitud en revisión</h2>
        <p className="mb-4 text-sm text-slate-400">
          Tu solicitud de verificación está siendo revisada por nuestro equipo. Te notificaremos cuando haya una
          decisión.
        </p>
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/40 p-4 text-left">
          <p className="mb-2 text-xs font-medium text-slate-500">Detalles de tu solicitud:</p>
          {request.justification && (
            <p className="mb-2 text-sm text-slate-300">
              <span className="font-medium">Justificación:</span> {request.justification}
            </p>
          )}
          {request.documentsUrl && (
            <p className="text-sm text-slate-300">
              <span className="font-medium">Documentos:</span>{' '}
              <a
                href={request.documentsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline"
              >
                {request.documentsUrl}
              </a>
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Enviada el {new Date(request.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
          </p>
        </div>
      </div>
    );
  }

  // Sin solicitud - mostrar formulario para crear una
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-blue-500/50 bg-blue-500/10">
            <VerifiedBadge size="lg" />
          </div>
        </div>
        <h2 className="mb-2 text-center text-xl font-semibold text-white">Verificación de cuenta</h2>
        <p className="mb-6 text-center text-sm text-slate-400">
          El badge azul de verificación ayuda a los usuarios a identificar cuentas auténticas. Para ser elegible,
          generalmente necesitas:
        </p>
        <ul className="mb-6 space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 size-5 shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Ser una figura pública, marca, celebridad o cuenta de interés público</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 size-5 shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Tener una cuenta completa y activa</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 size-5 shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Proporcionar documentación que pruebe tu identidad</span>
          </li>
        </ul>
        <button
          type="button"
          onClick={() => {
            setShowRequestDialog(true);
          }}
          className="w-full rounded-xl bg-primary-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-400"
        >
          Solicitar verificación
        </button>
      </div>

      {showRequestDialog && (
        <VerificationRequestDialog
          onClose={() => {
            setShowRequestDialog(false);
          }}
          onSuccess={() => {
            setShowRequestDialog(false);
          }}
        />
      )}
    </div>
  );
}


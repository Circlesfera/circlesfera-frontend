'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { useSessionStore } from '@/store/session';

import { deleteHighlight, getHighlights } from '../../../services/api/highlights';
import { CreateHighlightDialog } from './create-highlight-dialog';
import { HighlightViewer } from './highlight-viewer';

interface ProfileHighlightsProps {
  readonly profileHandle: string;
  readonly isOwnProfile: boolean;
}

export function ProfileHighlights({ profileHandle, isOwnProfile: isOwnProfileProp }: ProfileHighlightsProps): ReactElement {
  const queryClient = useQueryClient();
  const currentUser = useSessionStore((state) => state.user);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Calcular si es el perfil propio comparando handles
  const isOwnProfile = currentUser?.handle?.toLowerCase() === profileHandle.toLowerCase() || isOwnProfileProp;

  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  // Solo cargar highlights si es el propio perfil
  const { data, isLoading } = useQuery({
    queryKey: ['highlights'],
    queryFn: getHighlights,
    enabled: isOwnProfile && !!currentUser && isHydrated && !!accessToken,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHighlight,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['highlights'] });
      toast.success('Highlight eliminado');
    },
    onError: () => {
      toast.error('No se pudo eliminar el highlight');
    }
  });

  const highlights = data?.highlights ?? [];

  // Si no es el perfil propio, no mostrar nada por ahora
  // (En el futuro podríamos mostrar highlights públicos de otros usuarios)
  if (!isOwnProfile) {
    return <></>;
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="size-16 animate-pulse rounded-full bg-slate-800" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  const handleDelete = (highlightId: string, highlightName: string): void => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el highlight "${highlightName}"?`)) {
      deleteMutation.mutate(highlightId);
    }
  };

  return (
    <>
      <div className="w-full max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Highlights</h2>
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => {
                setShowCreateDialog(true);
              }}
              className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-400"
            >
              Nuevo
            </button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {highlights.map((highlight) => (
            <div key={highlight.id} className="flex flex-col items-center gap-1.5 min-w-[70px]">
              <button
                type="button"
                onClick={() => {
                  setSelectedHighlightId(highlight.id);
                }}
                className="relative group"
              >
                <div className="relative size-14 overflow-hidden rounded-full border-2 border-slate-300/50 dark:border-white/30 p-0.5">
                  {highlight.coverImageUrl ? (
                    <Image
                      src={highlight.coverImageUrl}
                      alt={highlight.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                      <svg className="size-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(highlight.id, highlight.name);
                    }}
                    className="absolute -top-1 -right-1 z-10 rounded-full bg-red-600 p-1 opacity-0 transition group-hover:opacity-100"
                  >
                    <svg className="size-3 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </button>
              <span className="max-w-[70px] truncate text-xs text-slate-900 dark:text-white/80 text-center">{highlight.name}</span>
            </div>
          ))}

          {highlights.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center text-xs text-slate-600 dark:text-slate-400">
              <svg className="size-10 text-slate-600 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <p>No tienes highlights aún</p>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDialog(true);
                  }}
                  className="mt-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-400"
                >
                  Crear tu primer highlight
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedHighlightId && (
        <HighlightViewer
          highlightId={selectedHighlightId}
          onClose={() => {
            setSelectedHighlightId(null);
          }}
        />
      )}

      {showCreateDialog && (
        <CreateHighlightDialog
          onClose={() => {
            setShowCreateDialog(false);
          }}
          onSuccess={() => {
            setShowCreateDialog(false);
            void queryClient.invalidateQueries({ queryKey: ['highlights'] });
          }}
        />
      )}
    </>
  );
}


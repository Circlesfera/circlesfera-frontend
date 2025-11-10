'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { type ReactElement, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { logger } from '@/lib/logger';
import { createTag, type CreateTagPayload } from '@/services/api/tags';
import { type PublicProfile,searchUsers } from '@/services/api/users';

interface AddTagDialogProps {
  readonly postId: string;
  readonly mediaIndex: number;
  readonly imageRef: React.RefObject<HTMLDivElement | null>;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onTagAdded?: () => void;
}

interface TagPosition {
  x: number;
  y: number;
}

export function AddTagDialog({
  postId,
  mediaIndex,
  imageRef,
  isOpen,
  onClose,
  onTagAdded
}: AddTagDialogProps): ReactElement | null {
  const [tagPosition, setTagPosition] = useState<TagPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: searchResults = [], isLoading: isSearching } = useQuery<PublicProfile[]>({
    queryKey: ['search', 'users', searchQuery],
    queryFn: () => searchUsers({ q: searchQuery, limit: 10 }),
    enabled: searchQuery.length >= 2,
    staleTime: 30000
  });

  const createTagMutation = useMutation({
    mutationFn: async (payload: CreateTagPayload) => createTag(postId, payload),
    onSuccess: () => {
      toast.success('Etiqueta agregada exitosamente');
      void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      setTagPosition(null);
      setSearchQuery('');
      onTagAdded?.();
      onClose();
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'No se pudo agregar la etiqueta';
      toast.error(message);
      logger.error('Error al crear etiqueta en post', { error, postId });
    }
  });

  // Manejar click en la imagen para posicionar el tag
  useEffect(() => {
    if (!isOpen || !imageRef.current) {
      return;
    }

    const handleImageClick = (e: MouseEvent): void => {
      const rect = imageRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      // Calcular posición relativa (normalizada 0-1)
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Validar que esté dentro de los límites
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        setTagPosition({ x, y });
      }
    };

    const imageElement = imageRef.current;
    imageElement.addEventListener('click', handleImageClick);

    return () => {
      imageElement.removeEventListener('click', handleImageClick);
    };
  }, [isOpen, imageRef]);

  if (!isOpen) {
    return null;
  }

  const handleSelectUser = (userId: string): void => {
    if (!tagPosition) {
      toast.error('Primero haz clic en la imagen para seleccionar la posición');
      return;
    }

    createTagMutation.mutate({
      userId,
      mediaIndex,
      x: tagPosition.x,
      y: tagPosition.y,
      isNormalized: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">Agregar etiqueta</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-400">
            {tagPosition
              ? 'Busca el usuario que quieres etiquetar'
              : 'Haz clic en la imagen para seleccionar la posición de la etiqueta'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {tagPosition && (
            <div className="rounded-lg bg-primary-500/10 border border-primary-500/20 p-3">
              <p className="text-sm text-primary-400 font-medium">Posición seleccionada</p>
              <p className="text-xs text-slate-400 mt-1">
                Coordenadas: ({Math.round(tagPosition.x * 100)}%, {Math.round(tagPosition.y * 100)}%)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Buscar usuario</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Buscar por nombre o handle..."
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!tagPosition}
            />
          </div>

          {searchQuery.length >= 2 && tagPosition && (
            <div className="max-h-64 overflow-y-auto rounded-lg bg-slate-800 border border-slate-700">
              {isSearching ? (
                <div className="p-4 text-center text-slate-400">Buscando...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No se encontraron usuarios</div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        handleSelectUser(user.id);
                      }}
                      disabled={createTagMutation.isPending}
                      className="w-full p-3 flex items-center gap-3 hover:bg-slate-700/50 transition disabled:opacity-50"
                    >
                      <div className="relative size-10 flex-shrink-0">
                        <Image
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.handle}`}
                          alt={user.displayName}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-white">{user.displayName}</p>
                        <p className="text-sm text-slate-400">@{user.handle}</p>
                      </div>
                      <svg className="size-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


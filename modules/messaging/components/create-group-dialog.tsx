'use client';

import Image from 'next/image';
import { useState, type ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createGroup, type CreateGroupPayload } from '@/services/api/messages';
import { searchUsers, type PublicProfile } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

interface CreateGroupDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function CreateGroupDialog({ isOpen, onClose }: CreateGroupDialogProps): ReactElement | null {
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useSessionStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['search', 'users', searchQuery],
    queryFn: () => searchUsers({ q: searchQuery, limit: 10 }),
    enabled: searchQuery.length >= 2,
    staleTime: 30000
  });

  const createGroupMutation = useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
    onSuccess: (data) => {
      toast.success('Grupo creado exitosamente');
      setGroupName('');
      setSelectedParticipants([]);
      setSearchQuery('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onClose();
    },
    onError: () => {
      toast.error('No se pudo crear el grupo');
    }
  });

  if (!isOpen) {
    return null;
  }

  const handleToggleParticipant = (userId: string): void => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = (): void => {
    if (!groupName.trim() || selectedParticipants.length === 0) {
      toast.error('Debes ingresar un nombre y seleccionar al menos un participante');
      return;
    }

    createGroupMutation.mutate({
      participantIds: selectedParticipants,
      groupName: groupName.trim()
    });
  };

  const selectedUsers = searchResults.filter((user) => selectedParticipants.includes(user.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Crear grupo</h2>

          {/* Nombre del grupo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre del grupo</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
              }}
              placeholder="Ej: Equipo de trabajo"
              className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={100}
            />
          </div>

          {/* Búsqueda de participantes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Agregar participantes</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Buscar usuarios..."
              className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Resultados de búsqueda */}
          {searchQuery.length >= 2 && (
            <div className="mb-4 max-h-48 overflow-y-auto rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              {isSearching ? (
                <div className="p-4 text-center text-slate-600 dark:text-slate-400">Buscando...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-slate-600 dark:text-slate-400">No se encontraron usuarios</div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {searchResults
                    .filter((user) => user.id !== currentUser?.id)
                    .map((user) => {
                      const isSelected = selectedParticipants.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            handleToggleParticipant(user.id);
                          }}
                          className={`w-full p-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition ${
                            isSelected ? 'bg-slate-100 dark:bg-slate-700/30' : ''
                          }`}
                        >
                          <div className="relative size-10 flex-shrink-0">
                            <Image
                              src={user.avatarUrl || '/default-avatar.png'}
                              alt={user.displayName}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-slate-900 dark:text-white">{user.displayName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">@{user.handle}</p>
                          </div>
                          {isSelected && (
                            <div className="size-5 rounded-full bg-primary-500 flex items-center justify-center">
                              <svg className="size-3 text-white dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Participantes seleccionados */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Participantes seleccionados ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <div className="relative size-6">
                      <Image
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt={user.displayName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-slate-900 dark:text-white">{user.displayName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleParticipant(user.id);
                      }}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={createGroupMutation.isPending || !groupName.trim() || selectedParticipants.length === 0}
              className="flex-1 px-4 py-2 rounded-lg bg-primary-600 dark:bg-primary-600 text-white dark:text-white font-medium hover:bg-primary-700 dark:hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createGroupMutation.isPending ? 'Creando...' : 'Crear grupo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


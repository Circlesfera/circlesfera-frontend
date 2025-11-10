'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { type ReactElement,useState } from 'react';
import { toast } from 'sonner';

import { addParticipant, type Conversation,removeParticipant, updateGroupName } from '@/services/api/messages';
import { searchUsers } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

interface GroupSettingsDialogProps {
  readonly conversation: Conversation;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function GroupSettingsDialog({ conversation, isOpen, onClose }: GroupSettingsDialogProps): ReactElement | null {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'add'>('info');
  const [groupName, setGroupName] = useState(conversation.groupName || '');
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useSessionStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['search', 'users', searchQuery],
    queryFn: () => searchUsers({ q: searchQuery, limit: 10 }),
    enabled: searchQuery.length >= 2,
    staleTime: 30000
  });

  const updateNameMutation = useMutation({
    mutationFn: (name: string) => updateGroupName(conversation.id, { groupName: name }),
    onSuccess: () => {
      toast.success('Nombre del grupo actualizado');
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('No se pudo actualizar el nombre del grupo');
    }
  });

  const addParticipantMutation = useMutation({
    mutationFn: (userId: string) => addParticipant(conversation.id, { userId }),
    onSuccess: () => {
      toast.success('Participante agregado');
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSearchQuery('');
    },
    onError: () => {
      toast.error('No se pudo agregar el participante');
    }
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (userId: string) => removeParticipant(conversation.id, userId),
    onSuccess: () => {
      toast.success('Participante removido');
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('No se pudo remover el participante');
    }
  });

  if (!isOpen || conversation.type !== 'group') {
    return null;
  }

  const participants = conversation.participants || [];
  const isCreator = conversation.createdBy === currentUser?.id;
  const canManage = isCreator || participants.some(p => p.id === currentUser?.id);

  const handleUpdateName = (): void => {
    if (!groupName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    updateNameMutation.mutate(groupName.trim());
  };

  const handleAddParticipant = (userId: string): void => {
    if (participants.some(p => p.id === userId)) {
      toast.error('Este usuario ya está en el grupo');
      return;
    }
    addParticipantMutation.mutate(userId);
  };

  const handleRemoveParticipant = (userId: string): void => {
    if (userId === currentUser?.id) {
      toast.error('No puedes removerte a ti mismo. Debes dejar el grupo.');
      return;
    }
    if (!isCreator) {
      toast.error('Solo el creador puede remover participantes');
      return;
    }
    removeParticipantMutation.mutate(userId);
  };

  const availableUsers = searchResults.filter(
    (user) => !participants.some((p) => p.id === user.id) && user.id !== currentUser?.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configuración del grupo</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200/50 dark:border-slate-800/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('info');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'info'
                ? 'text-primary-400 border-b-2 border-primary-500 bg-slate-50 dark:bg-slate-900/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30'
            }`}
          >
            Información
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('members');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'members'
                ? 'text-primary-400 border-b-2 border-primary-500 bg-slate-50 dark:bg-slate-900/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30'
            }`}
          >
            Miembros ({participants.length})
          </button>
          {canManage && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('add');
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'add'
                  ? 'text-primary-400 border-b-2 border-primary-500 bg-slate-50 dark:bg-slate-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30'
              }`}
            >
              Agregar
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre del grupo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => {
                      setGroupName(e.target.value);
                    }}
                    placeholder="Nombre del grupo"
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={100}
                    disabled={!canManage}
                  />
                  {canManage && (
                    <button
                      type="button"
                      onClick={handleUpdateName}
                      disabled={updateNameMutation.isPending || groupName.trim() === conversation.groupName}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">
                  Creado el {new Date(conversation.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 flex-shrink-0">
                      <Image
                        src={participant.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${participant.handle}`}
                        alt={participant.displayName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{participant.displayName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">@{participant.handle}</p>
                    </div>
                    {participant.id === conversation.createdBy && (
                      <span className="text-xs px-2 py-1 rounded-md bg-primary-500/20 text-primary-400 font-medium">
                        Creador
                      </span>
                    )}
                  </div>
                  {canManage && participant.id !== currentUser?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveParticipant(participant.id);
                      }}
                      disabled={removeParticipantMutation.isPending}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-400 transition disabled:opacity-50"
                      title="Remover del grupo"
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'add' && canManage && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Buscar usuarios</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Buscar por nombre o handle..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {searchQuery.length >= 2 && (
                <div className="max-h-64 overflow-y-auto rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  {isSearching ? (
                    <div className="p-4 text-center text-slate-600 dark:text-slate-400">Buscando...</div>
                  ) : availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-slate-600 dark:text-slate-400">No se encontraron usuarios</div>
                  ) : (
                    <div className="divide-y divide-slate-700">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            handleAddParticipant(user.id);
                          }}
                          disabled={addParticipantMutation.isPending}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition disabled:opacity-50"
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
                            <p className="font-medium text-slate-900 dark:text-white">{user.displayName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">@{user.handle}</p>
                          </div>
                          <svg className="size-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


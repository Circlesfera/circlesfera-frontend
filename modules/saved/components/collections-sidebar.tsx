'use client';

import Image from 'next/image';
import { useState, type ReactElement, FormEvent } from 'react';

import { getCollections, createCollection, deleteCollection, type Collection } from '@/services/api/collections';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CollectionsSidebarProps {
  readonly selectedCollectionId: string | null;
  readonly onSelectCollection: (collectionId: string | null) => void;
}

export function CollectionsSidebar({ selectedCollectionId, onSelectCollection }: CollectionsSidebarProps): ReactElement {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: getCollections
  });

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setShowCreateDialog(false);
      toast.success('Colección creada');
    },
    onError: () => {
      toast.error('No se pudo crear la colección');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
      if (selectedCollectionId && !data?.collections.find((c) => c.id === selectedCollectionId)) {
        onSelectCollection(null); // Volver a la colección por defecto si se eliminó la seleccionada
      }
      toast.success('Colección eliminada');
    },
    onError: () => {
      toast.error('No se pudo eliminar la colección');
    }
  });

  const collections = data?.collections ?? [];

  const handleCreate = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description?.trim() || undefined
    });
  };

  const handleDelete = (collectionId: string, collectionName: string): void => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la colección "${collectionName}"?`)) {
      deleteMutation.mutate(collectionId);
    }
  };

  return (
    <>
      <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Colecciones</h2>
          <button
            type="button"
            onClick={() => {
              setShowCreateDialog(true);
            }}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Crear colección"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => {
              const isSelected = selectedCollectionId === collection.id;
              const isDefault = collection.id === 'default';

              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => {
                    onSelectCollection(collection.id === 'default' ? null : collection.id);
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {collection.coverImageUrl ? (
                      <div className="relative size-12 overflow-hidden rounded-lg">
                        <Image src={collection.coverImageUrl} alt={collection.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg bg-slate-700">
                        <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-white">{collection.name}</h3>
                        {isDefault && (
                          <span className="flex-shrink-0 text-xs text-slate-400">(Por defecto)</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{collection.postCount} posts</p>
                    </div>
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(collection.id, collection.name);
                        }}
                        className="flex-shrink-0 rounded-full p-1.5 text-slate-500 transition hover:bg-red-900/20 hover:text-red-400"
                        title="Eliminar colección"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Dialog para crear colección */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Crear nueva colección</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-300">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={50}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Ej: Recetas, Inspiración..."
                />
              </div>
              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-300">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Describe tu colección..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDialog(false);
                  }}
                  disabled={createMutation.isPending}
                  className="rounded-xl border border-slate-700 bg-transparent px-6 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-xl bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


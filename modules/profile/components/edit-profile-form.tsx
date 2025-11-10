'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ReactElement,useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter,CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAvatarUrl } from '@/lib/image-utils';
import { uploadMedia } from '@/services/api/media';
import { type PublicProfile,updateProfile } from '@/services/api/users';
import { useSessionStore } from '@/store/session';

interface EditProfileFormProps {
  readonly profile: PublicProfile;
}

export function EditProfileForm({ profile }: EditProfileFormProps): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateUser = useSessionStore((state) => state.updateUser);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      // Invalidar todas las queries relacionadas
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['profile', profile.handle] });
      if (updatedProfile.handle !== profile.handle) {
        void queryClient.invalidateQueries({ queryKey: ['profile', updatedProfile.handle] });
      }
      
      // Actualizar el store de sesión
      updateUser(updatedProfile);
      
      // Refrescar la página del servidor para actualizar datos
      router.refresh();
      
      // Si el handle cambió, redirigir a la nueva URL del perfil
      if (updatedProfile.handle !== profile.handle) {
        router.push(`/${updatedProfile.handle}`);
        toast.success('Perfil actualizado correctamente. Redirigiendo...');
      } else {
        // Si no cambió el handle, redirigir al perfil para ver los cambios
        router.push(`/${updatedProfile.handle}`);
        toast.success('Perfil actualizado correctamente');
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
      const message = axiosError.response?.data?.message;
      const code = axiosError.response?.data?.code;
      
      if (code === 'HANDLE_ALREADY_EXISTS') {
        toast.error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
      } else {
        toast.error(message || 'No se pudo actualizar el perfil');
      }
    }
  });

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB para avatares)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir automáticamente
    setUploadingAvatar(true);
    try {
      const result = await uploadMedia(file);
      setAvatarUrl(result.url);
      toast.success('Avatar subido correctamente');
    } catch {
      toast.error('Error al subir el avatar. Inténtalo de nuevo.');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // Validar handle
    const trimmedHandle = handle.trim().toLowerCase();
    if (trimmedHandle && trimmedHandle.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    const payload: {
      displayName?: string;
      handle?: string;
      bio?: string | null;
      avatarUrl?: string | null;
    } = {};

    if (displayName.trim() !== profile.displayName) {
      payload.displayName = displayName.trim();
    }

    if (trimmedHandle !== profile.handle) {
      payload.handle = trimmedHandle;
    }

    if (bio.trim() !== (profile.bio ?? '')) {
      payload.bio = bio.trim() || null;
    }

    if (avatarUrl.trim() !== (profile.avatarUrl ?? '')) {
      payload.avatarUrl = avatarUrl.trim() || null;
    }

    if (Object.keys(payload).length === 0) {
      toast.info('No hay cambios para guardar');
      return;
    }

    updateMutation.mutate(payload);
  };

  const currentAvatarUrl = avatarPreview || getAvatarUrl(avatarUrl || profile.avatarUrl, profile.handle);
  const hasChanges = displayName !== profile.displayName || 
                     handle !== profile.handle || 
                     bio !== (profile.bio ?? '') || 
                     avatarUrl !== (profile.avatarUrl ?? '');

  return (
    <Card variant="glass" padding="lg" className="w-full max-w-3xl">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-3xl">Editar perfil</CardTitle>
        <CardDescription>
          Actualiza tu información pública y personaliza tu perfil
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-6 px-0">
          {/* Avatar Section */}
          <div className="space-y-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Avatar</h3>
            <div className="flex items-start gap-6">
              <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-slate-700 ring-2 ring-primary-500/20">
                <Image
                  src={currentAvatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 dark:bg-black/60 backdrop-blur-sm">
                    <div className="size-8 animate-spin rounded-full border-2 border-white dark:border-white border-t-transparent" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Button
                    type="button"
                    intent="secondary"
                    size="md"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    disabled={uploadingAvatar}
                    leftIcon={
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  >
                    {uploadingAvatar ? 'Subiendo...' : 'Subir imagen'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      void handleAvatarFileChange(event);
                    }}
                    className="hidden"
                  />
                </div>
                <div>
                  <Input
                    type="url"
                    label="O ingresa una URL"
                    placeholder="https://ejemplo.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setAvatarPreview(null);
                    }}
                    helperText="URL alternativa del avatar"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Formatos soportados: JPG, PNG, WebP. Tamaño máximo: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <svg className="size-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información personal
            </h3>

            <div className="space-y-4">
              <Input
                type="text"
                label="Nombre completo"
                placeholder="Tu nombre completo"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                }}
                maxLength={64}
                required
                helperText={`${displayName.length}/64 caracteres`}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-medium pointer-events-none z-10 select-none leading-none text-base">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="usuario"
                    value={handle}
                    onChange={(e) => {
                      // Solo permitir letras, números y guiones bajos
                      const value = e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase();
                      setHandle(value);
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 pr-4 py-3 pl-[2.75rem] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500/70 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40 transition-all duration-300"
                    maxLength={30}
                    required
                  />
                </div>
                {handle.length > 0 && handle.length < 3 ? (
                  <p className="mt-1.5 text-sm text-danger-400 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    El nombre de usuario debe tener al menos 3 caracteres
                  </p>
                ) : handle.length >= 3 ? (
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Solo letras, números y guiones bajos. Entre 3 y 30 caracteres.</p>
                ) : null}
              </div>

              <Textarea
                label="Biografía"
                placeholder="Cuenta algo sobre ti, tus intereses, o lo que te apasiona..."
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                maxLength={160}
                showCount
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-4 px-0 pb-0">
          <Button
            type="button"
            intent="ghost"
            size="lg"
            onClick={() => {
              router.back();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            intent="primary"
            size="lg"
            loading={updateMutation.isPending}
            disabled={!hasChanges || updateMutation.isPending}
          >
            Guardar cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

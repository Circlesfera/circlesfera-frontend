import { notFound } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { PostDetailShell } from '@/modules/posts/components/post-detail-shell';

/**
 * Página de detalle de un post individual.
 * El middleware ya verifica la autenticación para rutas protegidas.
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return {
    title: `Publicación — CircleSfera`
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }): Promise<ReactElement> {
  const { id } = await params;

  // Validar que el ID sea un ObjectId válido
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="w-full max-w-sm mx-auto px-4 md:px-6 py-4 md:py-6">
        <Suspense fallback={
          <div className="flex min-h-[400px] items-center justify-center w-full">
            <div className="text-center">
              <div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-slate-400">Cargando publicación...</p>
            </div>
          </div>
        }>
          <PostDetailShell postId={id} />
        </Suspense>
      </div>
    </main>
  );
}


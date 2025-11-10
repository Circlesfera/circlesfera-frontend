import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';
import { Suspense } from 'react';

import { PostDetailShell } from '@/modules/posts/components/post-detail-shell';

/**
 * Página de detalle de un post individual.
 * El middleware ya verifica la autenticación para rutas protegidas.
 */
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return {
    title: `Publicación — CircleSfera`,
    openGraph: {
      title: 'Publicación — CircleSfera',
      url: `/posts/${params.id}`
    }
  };
}

export default function PostPage({ params }: { params: { id: string } }): JSX.Element {
  const { id } = params;

  // Validar que el ID sea un ObjectId válido
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-sm px-4 py-4 md:px-6 md:py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[400px] w-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Cargando publicación...</p>
              </div>
            </div>
          }
        >
          <PostDetailShell postId={id} />
        </Suspense>
      </div>
    </main>
  );
}


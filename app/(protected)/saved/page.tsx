import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { type ReactElement,Suspense } from 'react';

import { SavedPostsShell } from '@/modules/saved/components/saved-posts-shell';

/**
 * Página de posts guardados. Requiere autenticación.
 */
export default async function SavedPage(): Promise<ReactElement> {
  const cookieStore = await cookies();
  // El backend establece la cookie 'circlesfera_refresh' después del login
  const refreshCookie = cookieStore.get('circlesfera_refresh');

  if (!refreshCookie) {
    const headersList = await headers();
    const protocol = headersList.get('x-forwarded-proto') ?? 'http';
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    if (host) {
      redirect(`${protocol}://${host}/`);
    }
    redirect('/');
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mb-8 rounded-2xl glass-card p-6 md:p-8 animate-fade-in">
        <h1 className="text-gradient-primary text-3xl font-bold md:text-4xl">
          Guardados
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Posts que has guardado
        </p>
      </div>
      <Suspense fallback={<div className="p-6 text-sm text-slate-600 dark:text-slate-400">Cargando guardados...</div>}>
        <SavedPostsShell />
      </Suspense>
    </main>
  );
}


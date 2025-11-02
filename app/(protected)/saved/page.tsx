import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { SavedPostsShell } from '@/modules/saved/components/saved-posts-shell';

/**
 * Página de posts guardados. Requiere autenticación.
 */
export default async function SavedPage(): Promise<ReactElement> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('circlesfera_session');

  if (!sessionCookie) {
    const headersList = await headers();
    const protocol = headersList.get('x-forwarded-proto') ?? 'http';
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    if (host) {
      redirect(`${protocol}://${host}/`);
    }
    redirect('/');
  }

  return (
    <main className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-slate-950/80 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Guardados</h1>
        <p className="mt-1 text-sm text-slate-400">Posts que has guardado</p>
      </div>
      <Suspense fallback={<div className="p-6 text-sm text-slate-400">Cargando guardados...</div>}>
        <SavedPostsShell />
      </Suspense>
    </main>
  );
}


import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { FeedShell } from '@/modules/feed/components/feed-shell';

/**
 * Página principal del feed autenticado. Verifica la sesión mediante cookies
 * y delega la renderización a `FeedShell`.
 */
export default async function FeedPage(): Promise<ReactElement> {
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
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-sm text-slate-400">Cargando feed...</div>}>
      <FeedShell />
    </Suspense>
  );
}


import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { ExploreGridShell } from '@/modules/explore/components/explore-grid-shell';

/**
 * Página de explorar. Requiere autenticación.
 */
export default async function ExplorePage(): Promise<ReactElement> {
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
      <Suspense fallback={<div className="p-6 text-sm text-slate-400">Cargando explorar...</div>}>
        <ExploreGridShell />
      </Suspense>
    </main>
  );
}


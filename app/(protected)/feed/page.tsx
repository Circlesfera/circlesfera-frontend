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
    <main className="relative flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="flex min-h-screen flex-col items-center justify-center p-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-2xl" />
              <div className="relative size-16 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500" />
            </div>
          </div>
        }
      >
        <FeedShell />
      </Suspense>
    </main>
  );
}


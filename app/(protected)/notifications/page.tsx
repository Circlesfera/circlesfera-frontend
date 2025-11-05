import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

import { NotificationsShell } from '@/modules/notifications/components/notifications-shell';

/**
 * Página de notificaciones. Requiere autenticación.
 */
export default async function NotificationsPage(): Promise<ReactElement> {
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
          Notificaciones
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Mantente al día con las últimas actualizaciones
        </p>
      </div>
      <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="text-center"><div className="size-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent mx-auto mb-3" /><p className="text-sm text-slate-600 dark:text-slate-400">Cargando notificaciones...</p></div></div>}>
        <NotificationsShell />
      </Suspense>
    </main>
  );
}


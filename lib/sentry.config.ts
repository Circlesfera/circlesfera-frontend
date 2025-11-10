import { clientEnv } from './env';

/**
 * Inicializa Sentry para error tracking en el frontend.
 * Solo se inicializa si NEXT_PUBLIC_SENTRY_DSN está configurado y Sentry está instalado.
 */
export const initSentry = (): void => {
  const dsn = clientEnv.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return; // Sentry no configurado, continuar sin él
  }

  void import('@sentry/nextjs')
    .then((sentry) => {
      sentry.init({
        dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError',
      'Failed to fetch'
    ],
      beforeSend(event: unknown, hint: unknown): unknown {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry error (dev mode):', event, hint);
            return null;
      }
      return event;
    }
    });
    })
    .catch(() => {
    // Sentry no disponible, ignorar silenciosamente
  });
};


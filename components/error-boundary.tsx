'use client';

import { Component, type ReactNode, type ReactElement } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar errores de React y mostrar UI amigable.
 * Previene que la aplicación completa se rompa por un error en un componente.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    // Loguear error para debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    }

    // Ejecutar callback si está definido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar a Sentry en producción
    if (process.env.NODE_ENV === 'production') {
      // Dynamic import para evitar bundle de Sentry si no está configurado
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Sentry es opcional y puede no estar instalado
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack
            }
          }
        });
      }).catch(() => {
        // Sentry no disponible, ignorar
      });
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-slate-900 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-8 text-center backdrop-blur-sm">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <svg
                  className="size-12 text-red-500 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">Algo salió mal</h1>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              Lo sentimos, ocurrió un error inesperado. Por favor, intenta recargar la página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left">
                <p className="mb-2 text-sm font-semibold text-red-500 dark:text-red-400">Error (solo en desarrollo):</p>
                <pre className="overflow-auto text-xs text-red-600 dark:text-red-300">{this.state.error.message}</pre>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-500"
              >
                Recargar página
              </button>
              <Link
                href="/feed"
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


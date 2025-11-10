declare module '@sentry/nextjs' {
  interface CaptureContext {
    readonly contexts?: Record<string, unknown>;
  }

  interface InitOptions {
    readonly dsn: string;
    readonly environment?: string;
    readonly tracesSampleRate?: number;
    readonly replaysSessionSampleRate?: number;
    readonly replaysOnErrorSampleRate?: number;
    readonly ignoreErrors?: readonly string[];
    readonly beforeSend?: (event: unknown, hint: unknown) => unknown;
  }

  // Runtime members that we leverage in the frontend
  export function init(options: InitOptions): void;
  export function captureException(error: unknown, context?: CaptureContext): void;
}



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

const logStubUsage = (message: string, payload?: unknown): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[SentryStub] ${message}`, payload);
  }
};

export const init = (options: InitOptions): void => {
  logStubUsage('init called', options);
};

export const captureException = (error: unknown, context?: CaptureContext): void => {
  logStubUsage('captureException called', { error, context });
};



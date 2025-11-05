/**
 * Componentes skeleton para estados de carga.
 * Mejoran la UX mientras se cargan componentes lazy.
 */

export function MessagesShellSkeleton(): React.ReactElement {
  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
      <div className="flex h-full">
        {/* Sidebar skeleton */}
        <div className="w-full border-r border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 sm:w-80">
          <div className="space-y-4 p-4">
            <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Chat skeleton */}
        <div className="hidden flex-1 flex-col sm:flex">
          <div className="space-y-4 p-6">
            <div className="h-16 rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
            <div className="flex-1 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
                    <div className="h-16 rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsShellSkeleton(): React.ReactElement {
  return (
    <div className="w-full max-w-7xl animate-pulse">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar skeleton */}
        <div className="w-full lg:w-72">
          <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 p-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 p-8">
            <div className="space-y-6">
              <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoriesViewerSkeleton(): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 dark:bg-black/90">
      <div className="h-[600px] w-[400px] rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
    </div>
  );
}

export function UploadShellSkeleton(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 p-8">
        <div className="h-64 rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
        <div className="space-y-4">
          <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
          <div className="h-24 rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
          <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800/50 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsShellSkeleton(): React.ReactElement {
  return (
    <div className="w-full max-w-7xl space-y-6 p-6">
      <div className="h-12 w-64 rounded-lg bg-slate-800/50 animate-shimmer" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 animate-shimmer" />
        ))}
      </div>
      <div className="h-96 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 animate-shimmer" />
    </div>
  );
}


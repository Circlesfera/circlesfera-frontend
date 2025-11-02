'use client';

import { type ReactElement } from 'react';

export function PrivacySettings(): ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Privacidad</h2>
        <p className="mt-2 text-sm text-slate-400">Controla quién puede ver tu contenido</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Cuenta privada</h3>
              <p className="mt-1 text-sm text-slate-400">
                Solo las personas que apruebes podrán ver tus publicaciones
              </p>
            </div>
            <div className="text-slate-500">Próximamente</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Actividad de estado</h3>
              <p className="mt-1 text-sm text-slate-400">Muestra cuándo estuviste activo por última vez</p>
            </div>
            <div className="text-slate-500">Próximamente</div>
          </div>
        </div>
      </div>
    </div>
  );
}


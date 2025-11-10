# CircleSfera Frontend

Aplicación web de CircleSfera construida con Next.js 16, React 19, Zustand y React Query. Incluye la landing pública y el área autenticada bajo el mismo dominio, comunicándose con el backend vía APIs tipadas.

## Requisitos
- Node.js >= 24.11
- npm >= 11.6.2

## Scripts
- `npm run dev`: ejecuta el entorno de desarrollo.
- `npm run build`: construye la aplicación para producción.
- `npm run start`: inicia el servidor en modo producción.
- `npm run lint`: ejecuta eslint (incluye reglas de Next y TypeScript).
- `npm run test`: corre pruebas unitarias con Jest + Testing Library.
- `npm run test:watch`: modo watch para pruebas.
- `npm run test:ci`: modo secuencial recomendado para CI.
- `npm run format`: valida formato con Prettier.

## Estructura principal
```
app/                    Rutas App Router y layouts (landing incluida)
components/marketing/   Secciones públicas (hero, métricas, CTA, footer)
components/ui/          Librería de componentes reutilizables (botones, etc.)
modules/                Funcionalidad por contexto (auth, feed, media...)
hooks/                  Hooks reutilizables (sesión, accesibilidad, etc.)
lib/                    Utilidades transversales (env, query client)
services/api/           Clientes HTTP generados a partir del backend
store/                  Zustand stores (sesión, UI)
styles/                 Tailwind tokens y estilos globales
tests/                  Suites unitarias/e2e
```

## Proxy y seguridad
- `proxy.ts` protege rutas autenticadas y envía a `/` a usuarios sin sesión; bloquea acceso a `/login`/`/register` para usuarios autenticados.
- Encabezados de seguridad definidos en `next.config.ts`.

## Estado Global y Datos
- **Zustand** (`store/session.ts`) persiste la sesión del usuario.
- **React Query** (`app/providers.tsx`) gestiona caching y mutaciones.
- **OpenAPI client** (pendiente) generará tipos y clientes a partir del backend.

## Estilo y UI
- Tailwind 3 + design tokens propios (`tailwind.config.ts`).
- Componentes accesibles y tipados.

## Testing
- Jest + React Testing Library (`tests/unit`).
- Playwright preparado para e2e.

## Próximos pasos
1. Construir flows de autenticación (login, registro, recuperación).
2. Implementar subida de medios con previews y validaciones.
3. Integrar notificaciones en tiempo real vía Socket.IO y Zustand.
<!-- Documentación de arquitectura del frontend de CircleSfera -->
# Arquitectura Frontend CircleSfera

## Propósito
Definir la estructura técnica del frontend para garantizar escalabilidad, mantenibilidad y un handoff claro con el backend. El stack principal es Next.js 16 con TypeScript, TailwindCSS, Zustand y React Query. La landing pública vive dentro de la misma aplicación (`app/page.tsx`) para ofrecer una experiencia continua bajo un único dominio.

## Estructura de Carpetas
```
app/                       Rutas (App Router) y layouts
  page.tsx                 Landing pública con secciones de marketing
  (protected)/             Secciones autenticadas (feed, exploración, etc.)
components/marketing/      Secciones hero, métricas, CTA, navegación pública
components/ui/             Librería de UI reutilizable (botones, inputs, modales)
modules/                   Lógica por feature (Auth, Feed, Media, Perfil, Ajustes)
hooks/                     Hooks reutilizables (sesión, viewport, accesibilidad)
services/api/              Clientes HTTP generados (OpenAPI) y servicios manuales
store/                     Estados globales (Zustand) y middlewares
lib/                       Utilidades (env, query client, validaciones)
styles/                    Configuración Tailwind, tokens de diseño, estilos globales
tests/                     Utilidades y configuración de pruebas unitarias/UI
```

## Estado y Datos
- **Zustand** para estados UI y sesión (`store/session`, `store/ui`).
- **React Query** (`services/api/queryClient.ts`) para caché de datos remotos, sincronizado con invalidaciones por sockets.
- **OpenAPI Client**: generación automática desde contratos backend (`services/api/generated`).

## Rutas Clave
- `/` landing pública con hero, métricas y CTA.
- `/login` / `/register` formularios de autenticación.
- `/feed` timeline principal con infinite scroll.
- `/explore` descubrimiento por hashtags/tendencias.
- `/upload` flujo de subida con previews y validaciones.
- `/[username]` perfiles públicos/propios.
- `/notifications` stream + historial.
- `/settings` ajustes de cuenta, privacidad y seguridad.

### Guardas y Middleware
- Middleware Next (`middleware.ts`) valida cookie de sesión; redirige usuarios no autenticados desde rutas protegidas al home (`/`) y evita que usuarios autenticados accedan a `/login` o `/register`.
- `app/page.tsx` comprueba la sesión en server y deriva a `/feed` en caso de estar autenticado.

## UI y Accesibilidad
- TailwindCSS con diseño responsivo, dark mode por defecto y tokens centralizados en `tailwind.config.ts`.
- Componentes marketing con glassmorphism ligero y animaciones suaves (Framer Motion opcional).
- Uso extensivo de `<Image>` y semántica adecuada para accesibilidad.

## Internacionalización y Analítica
- Estructura preparada para i18n (pendiente definir proveedor).
- Analítica encapsulada en `lib/analytics` (Plausible/Mixpanel) con carga condicionada.

## Seguridad y Performance
- Uso de headers de seguridad (`Strict-Transport-Security`, `X-Frame-Options`, `Permissions-Policy`).
- Sanitización de entradas con Zod y validaciones cliente/servidor.
- Imágenes gestionadas mediante `<Image>` y CDN remota.
- Feed principal usa React Query + streaming incremental para mantener la experiencia fluida.

## Testing
- **Unitarias/UI**: Jest + React Testing Library, MSW para mocks HTTP.
- **E2E**: Playwright (planificada en fases posteriores).
- Cobertura mínima 80% y reportes en CI.

## Integraciones Tiempo Real
- Suscripción a Socket.IO desde `modules/feed` y `modules/notifications`.
- Actualización optimista y sincronización con `React Query`.

## Próximos Pasos
1. Implementar flujos completos de autenticación (`/login`, `/register`).
2. Generar clientes OpenAPI y establecer suites de pruebas UI / e2e.
3. Añadir personalización de perfiles (`/[username]`) y feed de exploración agrupado.

## Referencias
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Zustand Patterns](https://docs.pmnd.rs/zustand)
- [React Query](https://tanstack.com/query/latest)


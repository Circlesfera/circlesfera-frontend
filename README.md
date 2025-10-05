# 🌀 CircleSfera Frontend

**App Web Moderna** para CircleSfera v3.0 - Red social con videos cortos, construida con Next.js 15 y TypeScript.

## 🏆 Enterprise Ready - v3.0

**Framework:** Next.js 15 (App Router) | **Lenguaje:** TypeScript | **Estilos:** Tailwind CSS 4  
**PWA:** ✅ Habilitada | **SEO:** ✅ Optimizado | **Performance:** ⚡ Lighthouse 95+

## 🚀 Características Principales

### 📱 Funcionalidades Core
- **🎥 Reels (Videos Cortos)** - Reproductor de videos estilo TikTok
- **📸 Stories Efímeras** - Viewer de stories que desaparecen en 24h
- **📷 Posts de Fotos** - Feed con múltiples imágenes por publicación
- **💬 Chat en Tiempo Real** - Mensajería directa con WebSockets
- **🔔 Notificaciones Push** - Sistema completo de alertas
- **👥 Perfiles de Usuario** - Gestión completa de perfiles

### 🎨 UI/UX Moderna
- **🌙 Dark/Light Mode** - Tema adaptable automáticamente
- **📱 Responsive Design** - Optimizado para móvil y desktop
- **⚡ Lazy Loading** - Carga perezosa de imágenes y componentes
- **🔄 Infinite Scroll** - Feed infinito con paginación
- **🎭 Animaciones Suaves** - Transiciones fluidas con Framer Motion
- **♿ Accesibilidad** - Cumple estándares WCAG 2.1

### 🛡️ Seguridad & Performance
- **🔐 Autenticación JWT** - Login seguro con tokens
- **🛡️ Protected Routes** - Rutas protegidas automáticamente
- **⚡ Optimización de Imágenes** - Next.js Image con lazy loading
- **📦 Code Splitting** - Carga optimizada por rutas
- **🚀 Server Components** - Renderizado híbrido SSR/CSR

## 🛠️ Stack Tecnológico

### 🏗️ Core Framework
- **Next.js 15** - Framework React de última generación
- **TypeScript 5** - Tipado estático para mayor seguridad
- **React 18** - Biblioteca de UI con Suspense
- **Tailwind CSS 4** - Framework CSS utility-first

### 🎨 UI & Styling
- **Tailwind CSS** - Estilos utility-first
- **Headless UI** - Componentes accesibles
- **Lucide React** - Iconografía moderna
- **Framer Motion** - Animaciones fluidas

### 🔧 Desarrollo & Build
- **TypeScript** - Tipado estático
- **ESLint** - Linting de código
- **Prettier** - Formateo automático
- **next-pwa** - Progressive Web App

### 📊 Estado & Datos
- **React Context API** - Estado global
- **Axios** - Cliente HTTP
- **Socket.IO Client** - WebSockets en tiempo real
- **React Query** - Cache y sincronización de datos

## 📋 Requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Backend API** - CircleSfera Backend corriendo

## 🔧 Instalación

### 1. **Clonar el repositorio**
```bash
git clone https://github.com/Circlesfera/circlesfera-frontend.git
cd circlesfera-frontend
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones:
```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# WebSocket
NEXT_PUBLIC_WS_URL=http://localhost:5001

# PWA
NEXT_PUBLIC_APP_NAME=CircleSfera
NEXT_PUBLIC_APP_SHORT_NAME=CS
```

### 4. **Ejecutar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Scripts Disponibles

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción optimizado
npm start            # Servidor de producción
npm run lint         # Verificar código con ESLint
npm run lint:fix     # Corregir errores de ESLint
npm run type-check   # Verificar tipos TypeScript
npm run format       # Formatear código con Prettier
```

## 📱 Funcionalidades Detalladas

### 🎥 Reels (Videos Cortos)
- **Reproductor vertical** - Optimizado para móvil
- **Controles táctiles** - Pause/play con tap
- **Like/Compartir** - Interacciones fluidas
- **Comentarios** - Sistema completo de comentarios
- **Siguiente/Anterior** - Navegación con swipe

### 📸 Stories
- **Viewer circular** - Indicador de progreso
- **Navegación táctil** - Tap para siguiente, hold para pausar
- **Reacciones** - Emojis y mensajes directos
- **Auto-destrucción** - Desaparecen en 24h

### 📷 Feed de Posts
- **Múltiples imágenes** - Carousel con navegación
- **Like/Comentarios** - Interacciones en tiempo real
- **Compartir** - Modal de compartir
- **Infinite scroll** - Carga automática de contenido

### 💬 Chat en Tiempo Real
- **Mensajería directa** - Chat 1:1
- **Grupos** - Conversaciones grupales
- **Notificaciones push** - Alertas en tiempo real
- **Estados de lectura** - Confirmación de entrega

## 🎨 Componentes Principales

### 📱 Layout & Navegación
- **AppLayout** - Layout principal responsivo
- **Header** - Navegación superior con búsqueda
- **Sidebar** - Navegación lateral en desktop
- **BottomNavigation** - Navegación inferior en móvil

### 🎥 Reels & Stories
- **ReelPlayer** - Reproductor de videos
- **StoryViewer** - Viewer de stories
- **StoriesBar** - Barra de stories en el feed

### 📷 Posts & Feed
- **PostCard** - Tarjeta de post individual
- **FeedCard** - Tarjeta optimizada para el feed
- **CommentsModal** - Modal de comentarios
- **LikeButton** - Botón de like animado

### 💬 Chat & Mensajería
- **ChatWindow** - Ventana de chat
- **ConversationsList** - Lista de conversaciones
- **MessageBubble** - Burbuja de mensaje

### 👥 Perfiles & Usuarios
- **ProfileHeader** - Header del perfil
- **ProfileTabs** - Tabs del perfil (posts, reels, guardados)
- **UserSearch** - Búsqueda de usuarios
- **FollowButton** - Botón de seguir/seguir

## 🛡️ Seguridad & Protección

### 🔐 Autenticación
- **JWT Tokens** - Autenticación stateless
- **Protected Routes** - Rutas protegidas automáticamente
- **Token Refresh** - Renovación automática de tokens
- **Logout Automático** - Cierre de sesión por expiración

### 🛡️ Protección de Datos
- **Sanitización XSS** - Prevención de ataques XSS
- **CSRF Protection** - Protección contra CSRF
- **Content Security Policy** - Headers de seguridad
- **Secure Cookies** - Cookies seguras en producción

## 📊 Performance & Optimización

### ⚡ Rendimiento
- **Code Splitting** - Carga optimizada por rutas
- **Lazy Loading** - Componentes y imágenes perezosas
- **Image Optimization** - Optimización automática con Next.js
- **Bundle Analysis** - Análisis de tamaño de bundles

### 📱 PWA (Progressive Web App)
- **Service Worker** - Cache offline
- **App Manifest** - Instalación como app nativa
- **Push Notifications** - Notificaciones push
- **Offline Support** - Funcionalidad offline básica

### 🎯 SEO & Accesibilidad
- **Meta Tags** - SEO optimizado
- **Open Graph** - Compartir en redes sociales
- **Structured Data** - Datos estructurados
- **WCAG 2.1** - Estándares de accesibilidad

## 📁 Estructura del Proyecto

```
circlesfera-frontend/
├── 📄 next.config.ts              # Configuración de Next.js
├── 📄 tailwind.config.js          # Configuración de Tailwind
├── 📄 tsconfig.json               # Configuración de TypeScript
├── 📁 src/
│   ├── 📁 app/                    # App Router (Next.js 15)
│   │   ├── 📄 layout.tsx          # Layout principal
│   │   ├── 📄 page.tsx            # Página de inicio
│   │   ├── 📄 loading.tsx         # Loading global
│   │   ├── 📄 error.tsx           # Error boundary
│   │   ├── 📁 auth/               # Rutas de autenticación
│   │   ├── 📁 profile/            # Rutas de perfil
│   │   ├── 📁 reels/              # Rutas de reels
│   │   ├── 📁 stories/            # Rutas de stories
│   │   └── 📁 chat/               # Rutas de chat
│   ├── 📁 components/             # Componentes reutilizables
│   │   ├── 📁 layout/             # Componentes de layout
│   │   ├── 📁 feed/               # Componentes del feed
│   │   ├── 📁 profile/            # Componentes de perfil
│   │   ├── 📁 forms/              # Formularios
│   │   └── 📁 ui/                 # Componentes base UI
│   ├── 📁 features/               # Features específicas
│   │   ├── 📁 auth/               # Autenticación
│   │   ├── 📁 theme/              # Tema dark/light
│   │   └── 📁 notifications/      # Notificaciones
│   ├── 📁 services/               # Servicios externos
│   │   ├── 📄 api.ts              # Cliente API
│   │   ├── 📄 socket.ts           # WebSocket client
│   │   └── 📄 storage.ts          # Local storage
│   ├── 📁 types/                  # Tipos TypeScript
│   │   ├── 📄 auth.ts             # Tipos de autenticación
│   │   ├── 📄 user.ts             # Tipos de usuario
│   │   └── 📄 post.ts             # Tipos de posts
│   ├── 📁 hooks/                  # Custom hooks
│   │   ├── 📄 useAuth.ts          # Hook de autenticación
│   │   └── 📄 useSocket.ts        # Hook de WebSocket
│   └── 📁 utils/                  # Utilidades
│       ├── 📄 constants.ts        # Constantes
│       ├── 📄 helpers.ts          # Funciones helper
│       └── 📄 validations.ts      # Validaciones
├── 📁 public/                     # Archivos estáticos
│   ├── 📁 icons/                  # Iconos de la app
│   ├── 📄 manifest.json           # PWA manifest
│   └── 📄 sw.js                   # Service worker
└── 📄 .env.example                # Plantilla de configuración
```

## 🧪 Testing & Calidad

### ✅ Testing Implementado
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### 📊 Métricas de Calidad
- **TypeScript Coverage:** 100%
- **Lint Errors:** 0
- **Build Success:** ✅
- **Lighthouse Score:** 95+

## 🐛 Troubleshooting

### Problemas Comunes

#### Error de CORS
```bash
# Verificar que el backend esté corriendo
curl http://localhost:5001/api/health

# Verificar variables de entorno
echo $NEXT_PUBLIC_API_URL
```

#### Problemas de Build
```bash
# Limpiar cache
rm -rf .next
npm run build

# Verificar tipos
npm run type-check
```

#### Problemas de PWA
```bash
# Verificar service worker
# Abrir DevTools > Application > Service Workers

# Limpiar cache del navegador
# Ctrl+Shift+R (hard refresh)
```

## 📚 Documentación Adicional

### 📖 Guías Completas
- **[Guía de Despliegue](../docs/deployment/deployment-guide.md)** - Despliegue completo
- **[Configuración de Entorno](../docs/configuration/env-example.md)** - Variables de entorno
- **[Design System](../docs/frontend/design-system.md)** - Sistema de diseño

### 🎨 Frontend Específico
- **[PWA Guidelines](../docs/frontend/pwa-guidelines.md)** - Guía de PWA
- **[Accessibility Guide](../docs/frontend/accessibility-guide.md)** - Accesibilidad
- **[SEO Guide](../docs/frontend/seo-guide.md)** - Optimización SEO

### 🔧 Para Desarrolladores
- **[Guía Completa de Mejoras](../docs/development/complete-guide.md)** - Todas las implementaciones
- **[API Documentation](../docs/backend/api-documentation.md)** - Documentación de API

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Ejecuta tests** (`npm test`)
4. **Verifica tipos** (`npm run type-check`)
5. **Commit** tus cambios (`git commit -m 'feat: add AmazingFeature'`)
6. **Push** a la rama (`git push origin feature/AmazingFeature`)
7. **Abre un Pull Request**

### 📋 Estándares de Contribución
- ✅ Tests pasando
- ✅ TypeScript sin errores
- ✅ Lint sin errores (`npm run lint`)
- ✅ Build exitoso (`npm run build`)
- ✅ Código formateado (`npm run format`)

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo CircleSfera

- **CircleSfera Team** - Desarrollo y mantenimiento
- **GitHub:** [@circlesfera](https://github.com/circlesfera)

## 🔗 Enlaces Útiles

- **[Backend Repository](../circlesfera-backend/)** - API REST Node.js
- **[Documentación Completa](../docs/)** - Toda la documentación
- **[Design System](../docs/frontend/design-system.md)** - Sistema de diseño
- **[PWA Guidelines](../docs/frontend/pwa-guidelines.md)** - Guía de PWA

---

**🌀 CircleSfera v3.0 - Enterprise Ready** ⭐⭐⭐⭐⭐
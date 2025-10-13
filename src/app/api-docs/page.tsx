import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Code, Key, Book, Zap, Shield, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'API Documentation - CircleSfera',
  description: 'Documentación completa de la API de CircleSfera para desarrolladores. Endpoints, autenticación, ejemplos y más.',
}

export default function APIDocsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/auth/register",
      description: "Registrar un nuevo usuario",
      auth: false
    },
    {
      method: "POST",
      path: "/api/auth/login",
      description: "Iniciar sesión",
      auth: false
    },
    {
      method: "GET",
      path: "/api/auth/profile",
      description: "Obtener perfil del usuario",
      auth: true
    },
    {
      method: "GET",
      path: "/api/posts/feed",
      description: "Obtener feed de publicaciones",
      auth: true
    },
    {
      method: "POST",
      path: "/api/posts",
      description: "Crear nueva publicación",
      auth: true
    },
    {
      method: "GET",
      path: "/api/users/search",
      description: "Buscar usuarios",
      auth: true
    }
  ]

  const features = [
    {
      icon: Zap,
      title: "RESTful API",
      description: "API REST completa con endpoints bien documentados y respuestas consistentes"
    },
    {
      icon: Shield,
      title: "Autenticación JWT",
      description: "Sistema de autenticación seguro basado en tokens JWT"
    },
    {
      icon: Globe,
      title: "WebSockets",
      description: "Conexiones en tiempo real para mensajería y notificaciones"
    },
    {
      icon: Code,
      title: "SDK Disponible",
      description: "Librerías oficiales para JavaScript, Python y más lenguajes"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Link
              href="/feed"
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Documentation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            API de CircleSfera
          </h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
            Integra CircleSfera en tus aplicaciones con nuestra API REST completa.
            Construye experiencias únicas con nuestros datos y funcionalidades.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Zap className="w-8 h-8 text-yellow-500 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inicio Rápido</h3>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Obtén tu API Key</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-3">
                Regístrate en CircleSfera y ve a Configuración - API para obtener tu clave de API.
              </p>
              <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                <div>curl -X POST https://api.circlesfera.com/auth/login \</div>
                <div className="ml-4">-H &quot;Content-Type: application/json&quot; \</div>
                <div className="ml-4">-d &apos;&#123;&quot;username&quot;: &quot;tu_usuario&quot;, &quot;password&quot;: &quot;tu_password&quot;&#125;&apos;</div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Autenticación</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-3">
                Incluye tu token JWT en el header Authorization de todas las peticiones.
              </p>
              <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                <div>Authorization: Bearer {"<"}tu_jwt_token{">"}</div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Realiza tu primera petición</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-3">
                Obtén tu feed de publicaciones con una simple petición GET.
              </p>
              <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                <div>curl -X GET https://api.circlesfera.com/posts/feed \</div>
                <div className="ml-4">-H &quot;Authorization: Bearer &#123;&lt;tu_token&gt;&#125;&quot;</div>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Book className="w-8 h-8 text-blue-500 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Endpoints Principales</h3>
          </div>

          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-gray-900 dark:text-gray-100 font-mono">{endpoint.path}</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    {endpoint.auth && (
                      <Key className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SDKs y Librerías */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">SDKs y Librerías</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">JavaScript/Node.js</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm mb-3">SDK oficial para aplicaciones web y Node.js</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 px-2 py-1 rounded">npm install @circlesfera/sdk</code>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Python</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm mb-3">Librería para aplicaciones Python</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 px-2 py-1 rounded">pip install circlesfera-sdk</code>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">PHP</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm mb-3">SDK para aplicaciones PHP</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 px-2 py-1 rounded">composer require circlesfera/sdk</code>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 mb-8 border border-orange-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Límites de Uso</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Límites por minuto:</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Autenticación: 5 requests/min</li>
                <li>• Publicaciones: 10 requests/min</li>
                <li>• Usuarios: 20 requests/min</li>
                <li>• General: 100 requests/min</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Límites por día:</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Cuentas gratuitas: 1,000 requests</li>
                <li>• Cuentas premium: 10,000 requests</li>
                <li>• Cuentas empresariales: 100,000 requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Soporte */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">¿Necesitas Ayuda?</h3>
          <p className="mb-6 opacity-90">
            Nuestro equipo de desarrolladores está aquí para ayudarte con la integración de la API.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Documentación Completa</h4>
              <p className="text-blue-100 text-sm mb-3">
                Accede a la documentación detallada con ejemplos y casos de uso.
              </p>
              <button className="bg-white dark:bg-gray-900 dark:bg-gray-900/20 hover:bg-white dark:bg-gray-900/30 px-4 py-2 rounded-lg transition-colors">
                Ver Documentación
              </button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Soporte Técnico</h4>
              <p className="text-blue-100 text-sm mb-3">
                Contacta con nuestro equipo para soporte técnico especializado.
              </p>
              <button className="bg-white dark:bg-gray-900 dark:bg-gray-900/20 hover:bg-white dark:bg-gray-900/30 px-4 py-2 rounded-lg transition-colors">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">Enlaces relacionados:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              Sobre nosotros
            </Link>
            <Link
              href="/press"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              Prensa
            </Link>
            <Link
              href="/terms"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              Términos de API
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

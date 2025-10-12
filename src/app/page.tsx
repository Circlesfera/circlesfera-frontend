'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'
import LoginModal from '@/components/landing/LoginModal'
import RegisterModal from '@/components/landing/RegisterModal'

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirigir a /feed si el usuario ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      router.push('/feed')
    }
  }, [user, loading, router])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // No mostrar la landing si el usuario está autenticado (ya se redirigirá)
  if (user) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Navegación */}
        <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  C
                </div>
                <span className="text-2xl font-bold text-gray-900">CircleSfera</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200">
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-200">
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm mb-8">
                <span className="text-xl">✨</span>
                <span className="text-sm text-gray-700 font-medium">La nueva red social de videos cortos</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gray-900">
                Crea, comparte e{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  inspira
                </span>
                <br />
                con videos cortos
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                CircleSfera es la plataforma donde tu creatividad cobra vida en segundos.
                <br />
                Conecta con millones de creadores, descubre contenido único y haz que tu voz{' '}
                <span className="font-semibold text-gray-900">se escuche en el mundo</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 w-full sm:w-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  🚀 Comenzar Ahora
                </button>

                <button
                  onClick={() => scrollToSection('features')}
                  className="px-8 py-4 rounded-full border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg w-full sm:w-auto">
                  ▶️ Ver Características
                </button>
              </div>

              {/* Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl">
                  <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                    <div className="flex justify-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="aspect-video rounded-xl relative overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 backdrop-blur-sm">
                          @
                        </div>
                        <span className="text-sm font-semibold drop-shadow-lg">CircleSfera</span>
                      </div>
                      <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-3xl backdrop-blur-sm">
                        ▶️
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                Una red social completa para{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  creadores
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Todas las herramientas que amas de Instagram, enfocadas en videos cortos y momentos que importan
              </p>
            </div>

            {/* Features principales en grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: '🎥',
                  title: 'Reels Ilimitados',
                  description: 'Publica videos cortos adictivos de hasta 60 segundos. Efectos, filtros y música integrada.'
                },
                {
                  icon: '⚡',
                  title: 'Stories 24h',
                  description: 'Comparte momentos efímeros que desaparecen en 24 horas. Perfecto para contenido del día a día.'
                },
                {
                  icon: '💬',
                  title: 'Mensajes Directos',
                  description: 'Chat privado con tus amigos y seguidores. Comparte reels, reacciona y mantente conectado.'
                },
                {
                  icon: '🔍',
                  title: 'Explora y Descubre',
                  description: 'Algoritmo personalizado que te muestra contenido que te encantará basado en tus intereses.'
                },
                {
                  icon: '👥',
                  title: 'Seguidores y Comunidad',
                  description: 'Construye tu audiencia. Interactúa con likes, comentarios y comparte contenido que amas.'
                },
                {
                  icon: '📊',
                  title: 'Analíticas en Tiempo Real',
                  description: 'Estadísticas detalladas de tus reels. Descubre qué funciona y cuándo publicar.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-5 transition-transform group-hover:scale-110 duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    <span className="filter drop-shadow-lg">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Feature destacado */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 shadow-xl"
            >
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                    <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                      ✨ Característica Principal
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    Tu contenido, tu audiencia, tu momento
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    CircleSfera está optimizada para videos cortos y contenido viral.
                    Nuestro algoritmo inteligente aprende de tus preferencias para mostrarte
                    exactamente lo que quieres ver, y ayudar a que tu contenido llegue a
                    millones de personas.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200">
                      <span>✓</span>
                      <span className="text-sm font-medium text-gray-700">Feed Personalizado</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200">
                      <span>✓</span>
                      <span className="text-sm font-medium text-gray-700">Notificaciones Inteligentes</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200">
                      <span>✓</span>
                      <span className="text-sm font-medium text-gray-700">Modo Oscuro</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-64 h-64 rounded-3xl flex items-center justify-center text-8xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    <span className="filter drop-shadow-2xl">📱</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="px-6 py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-xl"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                🚀
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Únete a la{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  revolución
                </span>
              </h2>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Crea tu cuenta gratis y comienza a compartir tu creatividad con el mundo.
                Únete a miles de creadores que ya están en CircleSfera.
              </p>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              >
                Crear Cuenta Gratis
              </button>

              <p className="text-sm text-gray-500 mt-6">
                🎁 Gratis para siempre. Sin tarjeta de crédito requerida.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                C
              </div>
              <span className="text-2xl font-bold text-gray-900">CircleSfera</span>
            </div>

            <p className="text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
              La plataforma de videos cortos que potencia tu creatividad.
              <br />
              Donde cada segundo cuenta una historia.
            </p>

            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} CircleSfera. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>

      {/* Modales */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => setShowRegisterModal(true)}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => setShowLoginModal(true)}
      />
    </>
  )
}

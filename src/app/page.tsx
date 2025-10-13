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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Navegación */}
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm dark:shadow-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-md">
                  C
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CircleSfera
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-5 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 transition-all duration-200 hidden sm:block">
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  Comenzar
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200 bg-blue-50 mb-8 shadow-sm dark:shadow-gray-900/50">
                <span className="text-xl">✨</span>
                <span className="text-sm text-blue-700 font-semibold">La nueva red social de videos cortos</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] text-gray-900 dark:text-gray-100 px-4">
                Crea, comparte e{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  inspira
                </span>
                <br />
                con videos cortos
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed px-4">
                CircleSfera es la plataforma donde tu creatividad cobra vida en segundos.
                Conecta con millones de creadores y haz que tu voz{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">se escuche en el mundo</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRegisterModal(true)}
                  className="px-8 py-4 rounded-xl text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 relative overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    🚀 Comenzar Gratis
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('features')}
                  className="px-8 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:bg-gray-800 hover:border-gray-400 transition-all duration-200 font-semibold text-base sm:text-lg w-full sm:w-auto shadow-sm dark:shadow-gray-900/50 hover:shadow-md">
                  Ver Características →
                </motion.button>
              </div>

              {/* Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-6xl mx-auto px-4"
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>

                  <div className="relative rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-2xl">
                    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                      <div className="flex justify-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm dark:shadow-gray-900/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm dark:shadow-gray-900/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm dark:shadow-gray-900/50"></div>
                      </div>
                      <div className="aspect-video rounded-lg relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                        {/* Floating elements */}
                        <motion.div
                          animate={{ y: [-10, 10, -10] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-6 left-6 flex items-center gap-2 text-white bg-white dark:bg-gray-900/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-xs font-bold">
                            C
                          </div>
                          <span className="text-sm font-semibold">@CircleSfera</span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="relative z-10 w-20 h-20 rounded-full bg-white dark:bg-gray-900/95 backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl cursor-pointer group">
                          <span className="group-hover:scale-110 transition-transform">▶️</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 sm:mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-gray-100 px-4">
                  Una red social completa para{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    creadores
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-3xl mx-auto px-4">
                  Todas las herramientas que amas de Instagram, enfocadas en videos cortos y momentos que importan
                </p>
              </motion.div>
            </div>

            {/* Features principales en grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
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
                  whileHover={{ y: -8 }}
                  className="relative rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm dark:shadow-gray-900/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-5 transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl">
                      <span className="filter drop-shadow-lg">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature destacado */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white p-12 shadow-xl"
            >
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/50 mb-6">
                    <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                      ✨ Característica Principal
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Tu contenido, tu audiencia, tu momento
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6 leading-relaxed">
                    CircleSfera está optimizada para videos cortos y contenido viral.
                    Nuestro algoritmo inteligente aprende de tus preferencias para mostrarte
                    exactamente lo que quieres ver, y ayudar a que tu contenido llegue a
                    millones de personas.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <span>✓</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Feed Personalizado</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <span>✓</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificaciones Inteligentes</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <span>✓</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo Oscuro</span>
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
        <section id="cta" className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 sm:p-12 lg:p-16 text-center shadow-2xl overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50"></div>

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8 bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl">
                  🚀
                </motion.div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Únete a la{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    revolución
                  </span>
                </h2>

                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Crea tu cuenta gratis y comienza a compartir tu creatividad con el mundo.
                  Únete a miles de creadores que ya están en CircleSfera.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRegisterModal(true)}
                  className="px-10 py-4 rounded-xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 relative overflow-hidden group"
                >
                  <span className="relative z-10">Crear Cuenta Gratis</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>

                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-6 flex items-center justify-center gap-2">
                  <span className="text-xl">🎁</span>
                  Gratis para siempre. Sin tarjeta de crédito requerida.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg">
                  C
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CircleSfera
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-sm sm:text-base">
                La plataforma de videos cortos que potencia tu creatividad.
                <br className="hidden sm:block" />
                Donde cada segundo cuenta una historia.
              </p>

              <div className="flex justify-center gap-6 mb-8">
                <button onClick={() => scrollToSection('features')} className="text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                  Características
                </button>
                <button onClick={() => setShowRegisterModal(true)} className="text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                  Comenzar
                </button>
                <button onClick={() => setShowLoginModal(true)} className="text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                  Iniciar Sesión
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} CircleSfera. Todos los derechos reservados.
              </p>
            </div>
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

import { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Users, Globe, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre nosotros - CircleSfera',
  description: 'Conoce más sobre CircleSfera, la red social moderna enfocada en videos cortos y contenido creativo.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-3xl text-white shadow-lg">
            C
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4">
            Bienvenido a CircleSfera
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
            La red social moderna donde la creatividad se encuentra con la comunidad.
            Un espacio para compartir, descubrir y conectar a través de contenido visual auténtico.
          </p>
        </div>

        {/* Misión */}
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Nuestra Misión</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-lg leading-relaxed">
            Crear un espacio digital donde cada persona pueda expresarse libremente,
            compartir su creatividad y formar conexiones genuinas. Creemos que las
            redes sociales deben ser un lugar de inspiración, no de comparación.
          </p>
        </div>

        {/* Valores */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <Users className="w-10 h-10 text-blue-500 mb-4" />
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-3">Comunidad</h4>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Construimos una comunidad inclusiva donde cada voz importa y
              cada historia tiene valor.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <Globe className="w-10 h-10 text-green-500 mb-4" />
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-3">Creatividad</h4>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Fomentamos la expresión creativa auténtica a través de videos cortos,
              historias y contenido visual.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <Shield className="w-10 h-10 text-purple-500 mb-4" />
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-3">Privacidad</h4>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Protegemos tu privacidad y datos personales con los más altos
              estándares de seguridad.
            </p>
          </div>
        </div>

        {/* Historia */}
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-6">Nuestra Historia</h3>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            <p>
              CircleSfera nació en 2025 en España con la visión de crear una alternativa
              fresca y auténtica a las redes sociales tradicionales. Inspirados por la
              necesidad de un espacio más humano y creativo en el mundo digital.
            </p>
            <p>
              Nuestro enfoque se centra en los videos cortos, las historias efímeras y
              las conexiones reales. Creemos que la mejor tecnología es la que se siente
              invisible y permite que la creatividad humana brille.
            </p>
            <p>
              Estamos en las primeras etapas de desarrollo, trabajando incansablemente
              para crear una plataforma que priorice el bienestar de los usuarios, la
              autenticidad del contenido y la construcción de comunidades significativas.
            </p>
          </div>
        </div>

        {/* Estado Actual */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12 border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-6 text-center">Estado Actual</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">🚀</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">En Desarrollo</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Plataforma en fase de construcción</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">👥</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Próximamente</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Primeros usuarios en camino</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">💡</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">Innovación</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Tecnología de vanguardia</p>
            </div>
          </div>
        </div>

        {/* Equipo */}
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-6">Nuestro Equipo</h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">
            Somos un pequeño equipo de desarrolladores, diseñadores y creativos
            apasionados por crear la mejor experiencia social digital. Trabajamos
            incansablemente para construir algo extraordinario.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center font-bold text-2xl text-white">
                D
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-1">Desarrollo</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Innovación técnica</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center font-bold text-2xl text-white">
                D
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-1">Diseño</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Experiencia de usuario</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center font-bold text-2xl text-white">
                C
              </div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-1">Comunidad</h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Crecimiento y engagement</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4">
            ¿Listo para ser parte de CircleSfera?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">
            Únete a nuestra comunidad y comienza a compartir tu creatividad
          </p>
          <Link
            href="/feed"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Comenzar ahora
          </Link>
        </div>
      </div>
    </div>
  )
}

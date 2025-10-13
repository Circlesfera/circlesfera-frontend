import { Metadata } from 'next'
import Link from 'next/link'
import { Download, Mail, Calendar, FileText, Image, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Prensa - CircleSfera',
  description: 'Información para medios de comunicación, recursos de prensa y contacto con el equipo de comunicación de CircleSfera.',
}

export default function PressPage() {
  const pressReleases = [
    {
      date: "2024-01-15",
      title: "CircleSfera alcanza los 10,000 usuarios activos en su primer mes",
      summary: "La nueva red social española supera expectativas en su lanzamiento inicial",
      category: "Hito"
    },
    {
      date: "2024-01-10",
      title: "CircleSfera presenta nuevas funciones de video corto",
      summary: "La plataforma introduce mejoras en la creación y edición de contenido",
      category: "Producto"
    },
    {
      date: "2024-01-05",
      title: "CircleSfera se lanza oficialmente en España",
      summary: "La nueva red social enfocada en creatividad y comunidad ya está disponible",
      category: "Lanzamiento"
    }
  ]

  const resources = [
    {
      icon: Image,
      title: "Logotipos y Branding",
      description: "Descarga los logotipos oficiales de CircleSfera en diferentes formatos",
      files: ["Logo PNG", "Logo SVG", "Logo Blanco", "Logo Negro"]
    },
    {
      icon: FileText,
      title: "Kit de Prensa",
      description: "Información completa sobre CircleSfera para medios",
      files: ["Ficha de empresa", "Fact Sheet", "Timeline", "Estadísticas"]
    },
    {
      icon: Users,
      title: "Fotos del Equipo",
      description: "Imágenes oficiales del equipo de CircleSfera",
      files: ["Fotos individuales", "Fotos de grupo", "Fotos oficina"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sala de Prensa
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bienvenido al centro de información para medios de comunicación.
            Aquí encontrarás todo lo que necesitas para cubrir CircleSfera.
          </p>
        </div>

        {/* Contacto de Prensa */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-4">Contacto de Prensa</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Para consultas de medios:</h4>
              <div className="flex items-center space-x-3 mb-2">
                <Mail className="w-5 h-5" />
                <span>prensa@circlesfera.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>Equipo de Comunicación</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Horario de atención:</h4>
              <p className="text-blue-100">Lunes a Viernes</p>
              <p className="text-blue-100">9:00 - 18:00 CET</p>
              <p className="text-blue-100 text-sm mt-2">
                Para urgencias fuera del horario, incluye "URGENTE" en el asunto del email.
              </p>
            </div>
          </div>
        </div>

        {/* Comunicados de Prensa */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Últimos Comunicados</h3>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {release.category}
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(release.date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{release.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{release.summary}</p>
                <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  <FileText className="w-4 h-4 mr-2" />
                  Leer más
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recursos de Prensa */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recursos de Prensa</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                  <resource.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{resource.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{resource.description}</p>
                <div className="space-y-2">
                  {resource.files.map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{file}</span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información de la Empresa */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Información de la Empresa</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Datos Básicos</h4>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-900">Nombre:</span>
                  <span className="ml-2 text-gray-600">CircleSfera</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Fundada:</span>
                  <span className="ml-2 text-gray-600">2024</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Ubicación:</span>
                  <span className="ml-2 text-gray-600">España</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Sector:</span>
                  <span className="ml-2 text-gray-600">Redes Sociales / Tecnología</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Empleados:</span>
                  <span className="ml-2 text-gray-600">15-20</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Estadísticas</h4>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-900">Estado:</span>
                  <span className="ml-2 text-gray-600">En desarrollo</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Usuarios:</span>
                  <span className="ml-2 text-gray-600">Próximamente</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Idiomas:</span>
                  <span className="ml-2 text-gray-600">Español, Inglés</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Enfoque:</span>
                  <span className="ml-2 text-gray-600">Videos cortos y creatividad</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Lanzamiento:</span>
                  <span className="ml-2 text-gray-600">2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Declaración de Misión */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Declaración de Misión</h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            CircleSfera nació con la visión de crear un espacio digital auténtico donde la creatividad
            florezca sin las presiones de las redes sociales tradicionales. Creemos en el poder de
            las historias visuales para conectar personas y construir comunidades significativas.
            Nuestra misión es democratizar la expresión creativa y fomentar conexiones genuinas
            en un entorno seguro e inclusivo.
          </p>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Enlaces relacionados:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sobre nosotros
            </Link>
            <Link
              href="/jobs"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Empleos
            </Link>
            <Link
              href="/api"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              API
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


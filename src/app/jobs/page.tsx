import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Users, Heart, Code, Palette, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Empleos - CircleSfera',
  description: 'Únete al equipo de CircleSfera. Oportunidades de trabajo en tecnología, diseño y más.',
}

export default function JobsPage() {
  const openPositions = [
    {
      title: "Frontend Developer",
      location: "Madrid, España (Remoto)",
      type: "Tiempo completo",
      department: "Ingeniería",
      description: "Buscamos un desarrollador frontend apasionado por crear experiencias de usuario excepcionales.",
      requirements: [
        "3+ años de experiencia en React/Next.js",
        "Conocimiento profundo de TypeScript",
        "Experiencia con Tailwind CSS",
        "Conocimiento de testing (Jest, Cypress)"
      ],
      icon: Code
    },
    {
      title: "UX/UI Designer",
      location: "Barcelona, España (Híbrido)",
      type: "Tiempo completo",
      department: "Diseño",
      description: "Diseñador creativo para mejorar la experiencia de usuario de nuestra plataforma.",
      requirements: [
        "Portfolio sólido en diseño de apps móviles/web",
        "Experiencia con Figma y herramientas de prototipado",
        "Conocimiento de principios de UX",
        "Experiencia en diseño de redes sociales"
      ],
      icon: Palette
    },
    {
      title: "Backend Developer",
      location: "Valencia, España (Remoto)",
      type: "Tiempo completo",
      department: "Ingeniería",
      description: "Desarrollador backend para construir y mantener nuestra API y servicios.",
      requirements: [
        "3+ años de experiencia en Node.js",
        "Experiencia con MongoDB y bases de datos NoSQL",
        "Conocimiento de microservicios",
        "Experiencia con Docker y AWS"
      ],
      icon: Code
    },
    {
      title: "Community Manager",
      location: "Sevilla, España (Remoto)",
      type: "Tiempo parcial",
      department: "Marketing",
      description: "Gestiona nuestra comunidad y crea contenido atractivo para las redes sociales.",
      requirements: [
        "Experiencia en gestión de comunidades digitales",
        "Conocimiento de redes sociales y tendencias",
        "Excelentes habilidades de comunicación",
        "Creatividad y capacidad de storytelling"
      ],
      icon: Users
    }
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Salario competitivo",
      description: "Remuneración acorde al mercado y tu experiencia"
    },
    {
      icon: MapPin,
      title: "Trabajo remoto",
      description: "Flexibilidad para trabajar desde donde prefieras"
    },
    {
      icon: Clock,
      title: "Horarios flexibles",
      description: "Adaptamos los horarios a tu estilo de vida"
    },
    {
      icon: Globe,
      title: "Equipos internacionales",
      description: "Trabaja con talento de diferentes países"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Link
              href="/feed"
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Empleos</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Únete a CircleSfera
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Forma parte de un equipo apasionado que está construyendo el futuro de las redes sociales.
            Buscamos talento excepcional para crear experiencias digitales auténticas.
          </p>
        </div>

        {/* Por qué trabajar con nosotros */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">¿Por qué CircleSfera?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posiciones abiertas */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Posiciones Abiertas</h3>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <position.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{position.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {position.type}
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {position.department}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    Aplicar
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">{position.description}</p>

                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Requisitos:</h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {position.requirements.map((requirement, reqIndex) => (
                      <li key={reqIndex}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proceso de selección */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Proceso de Selección</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Aplicación</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Envía tu CV y portfolio</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Revisión</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Evaluamos tu perfil</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Entrevista</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Conocemos tu experiencia</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Decisión</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Te damos una respuesta</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            ¿No ves la posición perfecta?
          </h3>
          <p className="mb-6 opacity-90">
            Siempre estamos buscando talento excepcional. Envíanos tu CV y te contactaremos
            cuando tengamos una oportunidad que se ajuste a tu perfil.
          </p>
          <button className="bg-white dark:bg-gray-900 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Enviar CV Espontáneo
          </button>
        </div>

        {/* Información de contacto */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mt-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Información de Contacto</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recursos Humanos</h4>
              <div className="space-y-2 text-gray-600">
                <p>Email: jobs@circlesfera.com</p>
                <p>Teléfono: +34 900 123 456</p>
                <p>Horario: Lunes a Viernes, 9:00 - 18:00 CET</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Síguenos</h4>
              <div className="space-y-2 text-gray-600">
                <p>LinkedIn: /company/circlesfera</p>
                <p>Twitter: @circlesfera_jobs</p>
                <p>Blog: blog.circlesfera.com/careers</p>
              </div>
            </div>
          </div>
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
              href="/press"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Prensa
            </Link>
            <Link
              href="/help"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Mail, Clock, Users, Building } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ubicaciones - CircleSfera',
  description: 'Encuentra nuestra oficina principal en Valencia, España.',
}

export default function LocationsPage() {
  const locations = [
    {
      city: "Valencia",
      country: "España",
      type: "Sede Principal",
      address: "Avenida del Puerto, 78",
      postalCode: "46023 Valencia",
      email: "info@circlesfera.com",
      hours: "Lunes a Viernes, 9:00 - 18:00 CET",
      description: "Nuestra sede principal donde trabajan todos nuestros equipos de desarrollo, diseño, marketing y soporte.",
      departments: ["Desarrollo", "Diseño", "Marketing", "Recursos Humanos", "Soporte", "QA"],
      coordinates: { lat: 39.4699, lng: -0.3763 }
    }
  ]


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Nuestras Ubicaciones
          </h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
            CircleSfera tiene su sede principal en Valencia, España.
            Nuestro equipo trabaja desde esta ubicación para crear la mejor experiencia de red social.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <Building className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">1</div>
            <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Oficina Principal</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">15+</div>
            <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Empleados totales</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">9-18</div>
            <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">Horario CET</div>
          </div>
        </div>

        {/* Oficinas */}
        <div className="space-y-8 mb-12">
          {locations.map((location, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{location.city}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {location.type}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">{location.description}</p>
                </div>
                <MapPin className="w-6 h-6 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Información de Contacto</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{location.postalCode}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">{location.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">{location.hours}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Departamentos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {location.departments.map((dept, deptIndex) => (
                      <div key={deptIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{dept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Visítanos */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">¿Quieres Visitar Nuestra Oficina?</h3>
          <p className="mb-6 opacity-90">
            Si estás interesado en conocer nuestra oficina en Valencia, participar en eventos
            o simplemente saludar, contáctanos con anticipación para coordinar tu visita.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Para Visitas</h4>
              <p className="text-blue-100 text-sm mb-3">
                Contacta con la oficina que te interesa visitar
              </p>
              <button className="bg-white dark:bg-gray-900 dark:bg-gray-900/20 hover:bg-white dark:bg-gray-900/30 px-4 py-2 rounded-lg transition-colors">
                Solicitar Visita
              </button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Eventos y Meetups</h4>
              <p className="text-blue-100 text-sm mb-3">
                Únete a nuestros eventos y meetups en diferentes ciudades
              </p>
              <button className="bg-white dark:bg-gray-900 dark:bg-gray-900/20 hover:bg-white dark:bg-gray-900/30 px-4 py-2 rounded-lg transition-colors">
                Ver Eventos
              </button>
            </div>
          </div>
        </div>

        {/* Mapa (placeholder) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mt-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ubicación de Nuestra Oficina</h3>
          <div className="bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3" />
              <p>Mapa interactivo de nuestra oficina en Valencia</p>
              <p className="text-sm">(Integración con Google Maps próximamente)</p>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">Enlaces relacionados:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/jobs"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              Empleos
            </Link>
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
          </div>
        </div>
      </div>
    </div>
  )
}

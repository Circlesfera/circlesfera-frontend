import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Eye, Lock, Database, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad - CircleSfera',
  description: 'Política de privacidad de CircleSfera. Cómo protegemos y manejamos tus datos personales.',
}

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Información que recopilamos",
      content: [
        "Información de cuenta (nombre, email, nombre de usuario)",
        "Contenido que compartes (posts, historias, mensajes)",
        "Información de uso (cómo interactúas con la plataforma)",
        "Información técnica (dirección IP, tipo de dispositivo)",
        "Información de ubicación (si la permites)"
      ]
    },
    {
      icon: Eye,
      title: "Cómo usamos tu información",
      content: [
        "Proporcionar y mejorar nuestros servicios",
        "Personalizar tu experiencia en la plataforma",
        "Comunicarnos contigo sobre actualizaciones",
        "Prevenir fraudes y mantener la seguridad",
        "Cumplir con obligaciones legales"
      ]
    },
    {
      icon: Lock,
      title: "Cómo protegemos tu información",
      content: [
        "Encriptación de datos en tránsito y en reposo",
        "Acceso restringido a información personal",
        "Monitoreo continuo de seguridad",
        "Capacitación regular del equipo en privacidad",
        "Auditorías de seguridad regulares"
      ]
    },
    {
      icon: Shield,
      title: "Tus derechos",
      content: [
        "Acceder a tu información personal",
        "Rectificar datos incorrectos",
        "Eliminar tu cuenta y datos",
        "Exportar tus datos",
        "Oponerte al procesamiento"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Tu Privacidad es Importante
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            En CircleSfera, nos comprometemos a proteger tu privacidad y ser transparentes
            sobre cómo recopilamos, usamos y protegemos tu información personal.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Última actualización: 10 de octubre de 2025
          </p>
        </div>

        {/* Introducción */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Introducción</h3>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Esta Política de Privacidad describe cómo CircleSfera ("nosotros", "nuestro" o "la empresa")
              recopila, usa, almacena y protege tu información cuando utilizas nuestra plataforma.
            </p>
            <p>
              Al usar CircleSfera, aceptas las prácticas descritas en esta política. Si no estás
              de acuerdo con alguna parte de esta política, por favor no uses nuestros servicios.
            </p>
            <p>
              Nos reservamos el derecho de actualizar esta política en cualquier momento. Te
              notificaremos sobre cambios significativos a través de la plataforma o por email.
            </p>
          </div>
        </div>

        {/* Secciones principales */}
        <div className="space-y-8 mb-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cookies */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Uso de Cookies</h3>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar
              el uso de la plataforma y personalizar el contenido.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cookies Esenciales</h4>
                <p className="text-sm text-gray-600">
                  Necesarias para el funcionamiento básico de la plataforma
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cookies de Rendimiento</h4>
                <p className="text-sm text-gray-600">
                  Nos ayudan a entender cómo usas la plataforma
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cookies de Funcionalidad</h4>
                <p className="text-sm text-gray-600">
                  Permiten funcionalidades mejoradas y personalización
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compartir información */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Compartir Información</h3>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              No vendemos, alquilamos ni compartimos tu información personal con terceros,
              excepto en las siguientes circunstancias:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start space-x-3">
                <span className="text-blue-500">•</span>
                <span>Con tu consentimiento explícito</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-500">•</span>
                <span>Para cumplir con obligaciones legales</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-500">•</span>
                <span>Con proveedores de servicios que nos ayudan a operar la plataforma</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-500">•</span>
                <span>En caso de fusión, adquisición o venta de activos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Retención de datos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Retención de Datos</h3>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Conservamos tu información personal solo durante el tiempo necesario para
              cumplir con los propósitos descritos en esta política, a menos que la ley
              requiera un período de retención más largo.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cuenta activa</h4>
                <p className="text-sm text-gray-600">
                  Mantenemos tu información mientras tu cuenta esté activa
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Después de eliminar cuenta</h4>
                <p className="text-sm text-gray-600">
                  Algunos datos pueden conservarse por razones legales o de seguridad
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">¿Tienes Preguntas?</h3>
          <p className="mb-6 opacity-90">
            Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos
            tu información, no dudes en contactarnos.
          </p>

          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5" />
            <span>privacy@circlesfera.com</span>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Enlaces relacionados:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/terms"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Términos de Servicio
            </Link>
            <Link
              href="/help"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Centro de Ayuda
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sobre nosotros
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

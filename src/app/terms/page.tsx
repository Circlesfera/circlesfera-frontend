import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, Users, Shield, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos de Servicio - CircleSfera',
  description: 'Términos de servicio de CircleSfera. Condiciones de uso de nuestra plataforma.',
}

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: "Uso de la Plataforma",
      content: [
        "Debes tener al menos 13 años para usar CircleSfera",
        "No puedes crear múltiples cuentas para eludir restricciones",
        "Eres responsable de mantener la seguridad de tu cuenta",
        "Debes proporcionar información precisa y actualizada",
        "No puedes transferir tu cuenta a terceros"
      ]
    },
    {
      icon: Shield,
      title: "Contenido y Comportamiento",
      content: [
        "Respetar a otros usuarios y sus derechos",
        "No compartir contenido ilegal, ofensivo o dañino",
        "No realizar spam o actividades comerciales no autorizadas",
        "No infringir derechos de propiedad intelectual",
        "Reportar contenido inapropiado cuando lo encuentres"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Contenido Prohibido",
      content: [
        "Contenido que promueva violencia o odio",
        "Información falsa o engañosa",
        "Contenido que viole derechos de autor",
        "Spam, phishing o actividades fraudulentas"
      ]
    },
    {
      icon: Scale,
      title: "Propiedad Intelectual",
      content: [
        "Conservas los derechos sobre tu contenido original",
        "Nos otorgas licencia para mostrar tu contenido en la plataforma",
        "Respetamos los derechos de propiedad intelectual de otros",
        "No puedes usar contenido de otros sin permiso",
        "Tenemos derecho a moderar contenido según nuestras políticas"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Link
              href="/feed"
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Términos de Servicio</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Términos de Servicio
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estos términos rigen tu uso de CircleSfera. Al usar nuestra plataforma,
            aceptas cumplir con estas condiciones.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Última actualización: 15 de enero de 2024
          </p>
        </div>

        {/* Introducción */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Introducción</h3>
          <div className="text-gray-700 space-y-4">
            <p>
              Bienvenido a CircleSfera. Estos Términos de Servicio ("Términos") constituyen
              un acuerdo legal entre tú y CircleSfera ("nosotros", "nuestro" o "la empresa")
              respecto al uso de nuestra plataforma.
            </p>
            <p>
              Al acceder o usar CircleSfera, aceptas estar sujeto a estos Términos.
              Si no estás de acuerdo con alguna parte de estos términos, no debes usar
              nuestros servicios.
            </p>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
            </p>
          </div>
        </div>

        {/* Secciones principales */}
        <div className="space-y-8 mb-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
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

        {/* Suspensión y Terminación */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Suspensión y Terminación</h3>
          <div className="text-gray-700 space-y-4">
            <p>
              Nos reservamos el derecho de suspender o terminar tu cuenta si violas estos
              Términos o nuestras políticas comunitarias.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Violaciones que pueden resultar en suspensión:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Comportamiento abusivo o acoso</li>
                  <li>• Compartir contenido inapropiado</li>
                  <li>• Violación de derechos de propiedad intelectual</li>
                  <li>• Uso de la plataforma para actividades ilegales</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Proceso de apelación:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Puedes apelar decisiones de moderación</li>
                  <li>• Revisaremos tu caso en un plazo razonable</li>
                  <li>• Te notificaremos sobre la decisión final</li>
                  <li>• Contacto: appeals@circlesfera.com</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Limitación de Responsabilidad */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Limitación de Responsabilidad</h3>
          <div className="text-gray-700 space-y-4">
            <p>
              CircleSfera se proporciona "tal como está" sin garantías de ningún tipo.
              No garantizamos que el servicio esté libre de errores o interrupciones.
            </p>
            <p>
              En ningún caso CircleSfera será responsable por daños indirectos, incidentales,
              especiales o consecuentes que resulten del uso o la imposibilidad de usar nuestros servicios.
            </p>
            <p>
              Nuestra responsabilidad total hacia ti por cualquier reclamo relacionado con
              estos términos o el servicio no excederá la cantidad que nos hayas pagado
              por el servicio en los 12 meses anteriores al evento que dio lugar al reclamo.
            </p>
          </div>
        </div>

        {/* Ley Aplicable */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ley Aplicable y Jurisdicción</h3>
          <div className="text-gray-700 space-y-4">
            <p>
              Estos términos se rigen por las leyes de España, sin consideración a los
              principios de conflicto de leyes.
            </p>
            <p>
              Cualquier disputa que surja de o esté relacionada con estos términos será
              resuelta exclusivamente en los tribunales competentes de Madrid, España.
            </p>
            <p>
              Si alguna disposición de estos términos es considerada inválida o inaplicable,
              las disposiciones restantes permanecerán en pleno vigor y efecto.
            </p>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">¿Preguntas sobre estos Términos?</h3>
          <p className="mb-6 opacity-90">
            Si tienes preguntas sobre estos Términos de Servicio, por favor contáctanos.
            Estamos aquí para ayudarte a entender nuestras políticas.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Contacto Legal</h4>
              <p className="text-blue-100 text-sm">
                legal@circlesfera.com
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Atención al Cliente</h4>
              <p className="text-blue-100 text-sm">
                support@circlesfera.com
              </p>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Enlaces relacionados:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/privacy"
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/help"
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Centro de Ayuda
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sobre nosotros
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

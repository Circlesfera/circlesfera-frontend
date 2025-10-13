import { Metadata } from 'next'
import Link from 'next/link'
import { Search, MessageCircle, Mail, Phone, BookOpen, Users, Shield, Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Centro de Ayuda - CircleSfera',
  description: 'Encuentra ayuda, tutoriales y respuestas a las preguntas más frecuentes sobre CircleSfera.',
}

export default function HelpPage() {
  const faqs = [
    {
      question: "¿Cómo creo mi primera publicación?",
      answer: "Para crear una publicación, haz clic en el botón '+' en el sidebar o en la barra superior. Puedes subir imágenes o videos, agregar un caption y seleccionar el aspect ratio que prefieras (1:1 o 4:5)."
    },
    {
      question: "¿Cómo funcionan las historias?",
      answer: "Las historias son contenido efímero que desaparece después de 24 horas. Puedes crear una historia desde el botón '+' y seleccionando 'Crear Historia'. El contenido debe tener proporción 9:16."
    },
    {
      question: "¿Cómo puedo seguir a otros usuarios?",
      answer: "Puedes seguir a usuarios desde sus perfiles haciendo clic en el botón 'Seguir', o desde las sugerencias que aparecen en tu sidebar. También puedes buscar usuarios en la sección 'Explorar'."
    },
    {
      question: "¿Cómo cambio mi foto de perfil?",
      answer: "Ve a tu perfil, haz clic en 'Editar perfil' y luego en tu foto de perfil actual. Podrás subir una nueva imagen y recortarla según tus preferencias."
    },
    {
      question: "¿Cómo reporto contenido inapropiado?",
      answer: "Si encuentras contenido que viola nuestras políticas, puedes reportarlo haciendo clic en los tres puntos (...) del post y seleccionando 'Reportar'. Nuestro equipo revisará el contenido."
    },
    {
      question: "¿Cómo cambio mi contraseña?",
      answer: "Ve a Configuración > Cuenta > Cambiar contraseña. Introduce tu contraseña actual y la nueva contraseña dos veces para confirmarla."
    }
  ]

  const categories = [
    {
      icon: BookOpen,
      title: "Primeros pasos",
      description: "Aprende lo básico de CircleSfera",
      topics: ["Crear cuenta", "Configurar perfil", "Primera publicación"]
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Interactúa con otros usuarios",
      topics: ["Seguir usuarios", "Mensajes", "Comentarios"]
    },
    {
      icon: Settings,
      title: "Configuración",
      description: "Personaliza tu experiencia",
      topics: ["Privacidad", "Notificaciones", "Cuenta"]
    },
    {
      icon: Shield,
      title: "Seguridad",
      description: "Mantén tu cuenta segura",
      topics: ["Contraseñas", "Reportar contenido", "Bloquear usuarios"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4">
            ¿En qué podemos ayudarte?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
            Encuentra respuestas rápidas, tutoriales detallados y toda la información
            que necesitas para aprovechar al máximo CircleSfera.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl p-6 mb-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 dark:placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {categories.map((category, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">{category.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-3">{category.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.topics.map((topic, topicIndex) => (
                      <span
                        key={topicIndex}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-6">Preguntas Frecuentes</h3>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-b-0">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">{faq.question}</h4>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h3>
          <p className="mb-6 opacity-90">
            Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Chat en vivo</div>
                <div className="text-sm opacity-75">Disponible 24/7</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-sm opacity-75">support@circlesfera.com</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Teléfono</div>
                <div className="text-sm opacity-75">+34 900 123 456</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">También te puede interesar:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="px-4 py-2 bg-white dark:bg-gray-900 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              Sobre nosotros
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-2 bg-white dark:bg-gray-900 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              Política de privacidad
            </Link>
            <Link
              href="/terms"
              className="px-4 py-2 bg-white dark:bg-gray-900 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              Términos de servicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

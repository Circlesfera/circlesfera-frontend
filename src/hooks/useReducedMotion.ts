/**
 * 🎬 useReducedMotion Hook
 * ========================
 * Detecta si el usuario prefiere movimiento reducido
 * Respeta preferencias del sistema operativo
 * Mejora performance en móvil
 *
 * ✅ Accesibilidad WCAG 2.1
 * ✅ Performance optimization
 * ✅ Respeta preferencias del usuario
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
 */

import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Verificar si el navegador soporta matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    // Media query para detectar preferencia
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Establecer estado inicial
    setPrefersReducedMotion(mediaQuery.matches)

    // Listener para cambios
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches)
    }

    // Agregar listener
    // Usar addEventListener si está disponible, sino addListener (legacy)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Legacy support
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Legacy support
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook para detectar si es dispositivo móvil
 * Útil para deshabilitar animaciones pesadas en móvil
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check inicial
    checkMobile()

    // Listener para resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Hook combinado que detecta si deberíamos desactivar animaciones
 * Retorna true si:
 * - Usuario prefiere reduced motion
 * - O está en dispositivo móvil (opcional)
 */
export function useShouldReduceMotion(options: {
  reduceOnMobile?: boolean
} = {}): boolean {
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  return prefersReducedMotion || (options.reduceOnMobile === true && isMobile)
}


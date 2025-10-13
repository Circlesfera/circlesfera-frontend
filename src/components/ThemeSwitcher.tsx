"use client"

/**
 * 🌓 THEME SWITCHER
 * =================
 * Botón para cambiar entre tema claro y oscuro
 *
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Touch target 44x44px
 * ✅ Animación suave
 * ✅ ARIA labels descriptivos
 */

import React from 'react'
import { useTheme } from '@/features/theme/ThemeProvider'
import { motion } from 'framer-motion'
// import { TOUCH_TARGET_CLASSES } from '@/utils/accessibilityHelpers'

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

export interface ThemeSwitcherProps {
  variant?: 'icon' | 'button'
  className?: string
}

export default function ThemeSwitcher({
  variant = 'icon',
  className = ''
}: ThemeSwitcherProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`min-w-[44px] min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
        aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-700 dark:text-gray-300"
        >
          {isDark ? (
            <SunIcon className="w-5 h-5" aria-hidden="true" />
          ) : (
            <MoonIcon className="w-5 h-5" aria-hidden="true" />
          )}
        </motion.div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDark ? 'Claro' : 'Oscuro'}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`min-w-[44px] min-h-[44px] p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-pressed={isDark}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 0.5 }}
        className="text-gray-700 dark:text-gray-300"
      >
        {isDark ? (
          <SunIcon className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MoonIcon className="w-6 h-6" aria-hidden="true" />
        )}
      </motion.div>
    </button>
  )
}


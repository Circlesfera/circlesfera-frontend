"use client"

import { useState, useEffect } from 'react'

type InspectedElement = {
  selector: string;
  tagName: string;
  className: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
  hasDarkClass: boolean;
  htmlHasDarkClass: boolean;
}

export default function ThemeInspector() {
  const [inspectedElements, setInspectedElements] = useState<InspectedElement[]>([])

  const inspectThemeElements = () => {
    console.log('🔍 Inspecting theme elements...')

    const elements: InspectedElement[] = []

    // Buscar elementos con clases que deberían cambiar con el tema
    const selectors = [
      'body',
      '.bg-white',
      '.bg-gray-50',
      '.bg-gray-100',
      '.bg-gray-900',
      '.text-gray-900',
      '.text-gray-100',
      '.border-gray-200',
      '.border-gray-700'
    ]

    selectors.forEach(selector => {
      const foundElements = document.querySelectorAll(selector)
      foundElements.forEach((el, index) => {
        if (index < 3) { // Limitar a 3 elementos por selector
          const computedStyles = window.getComputedStyle(el)
          const elementInfo = {
            selector,
            tagName: el.tagName,
            className: el.className,
            backgroundColor: computedStyles.backgroundColor,
            color: computedStyles.color,
            borderColor: computedStyles.borderColor,
            hasDarkClass: el.className.includes('dark:'),
            htmlHasDarkClass: document.documentElement.classList.contains('dark')
          }
          elements.push(elementInfo)
        }
      })
    })

    setInspectedElements(elements)
    console.log('📊 Inspected elements:', elements)
  }

  const forceLightMode = () => {
    console.log('☀️ Forcing light mode...')

    // Remover clase dark del HTML
    document.documentElement.classList.remove('dark')

    // Forzar estilos claros en elementos específicos
    const elements = document.querySelectorAll('*')
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        // Forzar estilos claros
        if (el.className.includes('bg-gray-900')) {
          el.style.backgroundColor = '#ffffff'
        }
        if (el.className.includes('text-gray-100')) {
          el.style.color = '#111827'
        }
        if (el.className.includes('border-gray-700')) {
          el.style.borderColor = '#e5e7eb'
        }
      }
    })

    localStorage.setItem('theme', 'light')
    console.log('✅ Light mode forced')
  }

  const forceDarkMode = () => {
    console.log('🌙 Forcing dark mode...')

    // Agregar clase dark al HTML
    document.documentElement.classList.add('dark')

    localStorage.setItem('theme', 'dark')
    console.log('✅ Dark mode forced')
  }

  useEffect(() => {
    inspectThemeElements()
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white dark:bg-gray-900 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-3">
          Theme Inspector
        </div>

        <div className="space-y-2 mb-4">
          <button
            onClick={inspectThemeElements}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            🔍 Inspect Elements
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={forceLightMode}
              className="px-3 py-2 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
            >
              ☀️ Force Light
            </button>
            <button
              onClick={forceDarkMode}
              className="px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
            >
              🌙 Force Dark
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Current Theme: {document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}
        </div>

        {inspectedElements.length > 0 && (
          <div className="max-h-40 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Inspected Elements:
            </div>
            {inspectedElements.slice(0, 5).map((element, index) => (
              <div key={index} className="text-xs text-gray-600 dark:text-gray-400 mb-1 p-2 bg-gray-50 dark:bg-gray-800 dark:bg-gray-700 rounded">
                <div><strong>{element.selector}</strong></div>
                <div>BG: {element.backgroundColor}</div>
                <div>Color: {element.color}</div>
                <div>Has dark: {element.hasDarkClass ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

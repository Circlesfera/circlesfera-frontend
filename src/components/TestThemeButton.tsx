"use client"

import React, { useState, useEffect } from 'react'

export default function TestThemeButton() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Verificar el tema actual al montar
    const root = document.documentElement
    setIsDark(root.classList.contains('dark'))
  }, [])

  const handleClick = () => {
    console.log('🔍 TestThemeButton clicked!')
    const root = document.documentElement
    const currentIsDark = root.classList.contains('dark')

    console.log('Current theme:', currentIsDark ? 'dark' : 'light')

    if (currentIsDark) {
      root.classList.remove('dark')
      console.log('✅ Changed to light mode')
      setIsDark(false)
    } else {
      root.classList.add('dark')
      console.log('✅ Changed to dark mode')
      setIsDark(true)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="min-w-[44px] min-h-[44px] p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      type="button"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

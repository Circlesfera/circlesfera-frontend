"use client"

import React from 'react'

export default function TestThemeButton() {
  const handleClick = () => {
    const root = document.documentElement
    const isDark = root.classList.contains('dark')

    if (isDark) {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="min-w-[44px] min-h-[44px] p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
    >
      🌓
    </button>
  )
}

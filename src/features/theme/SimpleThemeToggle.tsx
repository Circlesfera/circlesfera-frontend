"use client";

import React from 'react';
import { useTheme } from './ThemeContext';

export function SimpleThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    console.log('SimpleThemeToggle clicked! Current theme:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Changing to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleClick}
      className="w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      type="button"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

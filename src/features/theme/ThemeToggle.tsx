"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ThemeToggle({ showLabel = false, size = 'md', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = () => {
    console.log('ThemeToggle clicked. Current theme:', theme);
    if (theme === 'light') {
      console.log('Changing to dark');
      setTheme('dark');
    } else if (theme === 'dark') {
      console.log('Changing to system');
      setTheme('system');
    } else {
      console.log('Changing to light');
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className={iconSizes[size]} />;
      case 'dark':
        return <Moon className={iconSizes[size]} />;
      case 'system':
        return <Monitor className={iconSizes[size]} />;
      default:
        return <Sun className={iconSizes[size]} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Modo claro';
      case 'dark':
        return 'Modo oscuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Tema';
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`${sizeClasses[size]} rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors duration-200 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={getLabel()}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-gray-600 dark:text-gray-300"
      >
        {getIcon()}
      </motion.div>

      {showLabel && (
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {getLabel()}
        </span>
      )}
    </motion.button>
  );
}

// Componente para el menú de temas
export function ThemeMenu() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Modo claro', icon: Sun },
    { value: 'dark' as const, label: 'Modo oscuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="space-y-1">
      {themes.map(({ value, label, icon: Icon }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${theme === value
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.1 }}
        >
          <Icon className="w-4 h-4 mr-3" />
          {label}
          {theme === value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

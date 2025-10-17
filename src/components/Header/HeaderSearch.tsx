/**
 * 🔍 HEADER SEARCH
 * ================
 * Componente de búsqueda del header
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Keyboard accessible
 */

'use client'

import React from 'react'
import { SearchIcon } from '@/components/icons/NavigationIcons'
import { UserSearch } from '@/features/explore/components'
import { ARIA_LABELS } from '@/utils/accessibilityHelpers'

export interface HeaderSearchProps {
  searchQuery: string
  searchFocused: boolean
  showSearch: boolean
  searchRef: React.RefObject<HTMLDivElement | null>
  onSearchChange: (query: string) => void
  onSearchFocus: () => void
  onSearchBlur: () => void
  onSearchSubmit: (e: React.FormEvent) => void
  onResultClick: () => void
}

export function HeaderSearch({
  searchQuery,
  searchFocused,
  showSearch,
  searchRef,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchSubmit,
  onResultClick,
}: HeaderSearchProps) {
  return (
    <div className="hidden md:block w-72 relative" ref={searchRef}>
      <form onSubmit={onSearchSubmit} role="search">
        <div className="relative">
          <input
            type="search"
            placeholder="Buscar usuarios, posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className={`w-full pl-12 pr-4 py-2 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:border-gray-700 rounded-xl text-center text-sm text-gray-900 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-gray-500 dark:placeholder-gray-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 focus-visible:shadow-lg transition-all duration-200 ${searchFocused ? 'border-blue-400 bg-white dark:bg-gray-900 shadow-lg' : 'hover:border-gray-300 dark:border-gray-600'
              }`}
            aria-label={ARIA_LABELS.navigation.search}
            autoComplete="off"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 pointer-events-none">
            <SearchIcon aria-hidden="true" />
          </div>
        </div>
      </form>

      {/* Resultados de búsqueda */}
      {showSearch && searchQuery && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50 animate-fade-in"
          role="region"
          aria-label="Resultados de búsqueda"
        >
          <UserSearch query={searchQuery} onResultClick={onResultClick} />
        </div>
      )}
    </div>
  )
}


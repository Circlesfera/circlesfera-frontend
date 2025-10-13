/**
 * 🎯 useHeaderState Hook
 * ======================
 * Hook para manejar el estado y lógica del Header
 * Separa la lógica de UI para mejor testabilidad
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import logger from '@/utils/logger'

export interface UseHeaderStateReturn {
  // Estados de búsqueda
  searchQuery: string
  searchFocused: boolean
  showSearch: boolean
  searchRef: React.RefObject<HTMLDivElement | null>

  // Estados de menús
  mobileMenuOpen: boolean
  showCreateMenu: boolean
  showUserMenu: boolean
  userMenuRef: React.RefObject<HTMLDivElement | null>

  // Estados de modales
  showPostForm: boolean
  showStoryForm: boolean
  showReelForm: boolean

  // Setters
  setSearchQuery: (query: string) => void
  setSearchFocused: (focused: boolean) => void
  setShowSearch: (show: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setShowCreateMenu: (show: boolean) => void
  setShowUserMenu: (show: boolean) => void
  setShowPostForm: (show: boolean) => void
  setShowStoryForm: (show: boolean) => void
  setShowReelForm: (show: boolean) => void

  // Handlers
  handleSearchSubmit: (e: React.FormEvent) => void
  handlePostCreated: () => void
  handleStoryCreated: () => void
  handleReelCreated: () => void
  handleLogout: () => Promise<void>
  closeAllMenus: () => void
}

export interface UseHeaderStateProps {
  onLogout?: () => void
}

export function useHeaderState({ onLogout }: UseHeaderStateProps = {}): UseHeaderStateReturn {
  const router = useRouter()

  // Estados
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)
  const [showStoryForm, setShowStoryForm] = useState(false)
  const [showReelForm, setShowReelForm] = useState(false)

  // Refs
  const searchRef = useRef<HTMLDivElement | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    closeAllMenus()
  }, [router])

  // Cerrar todos los menús
  const closeAllMenus = () => {
    setMobileMenuOpen(false)
    setShowCreateMenu(false)
    setShowPostForm(false)
    setShowStoryForm(false)
    setShowReelForm(false)
    setShowUserMenu(false)
    setShowSearch(false)
  }

  // Handler de búsqueda
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  // Handlers de creación de contenido
  const handlePostCreated = () => {
    setShowPostForm(false)
    setShowCreateMenu(false)
  }

  const handleStoryCreated = () => {
    setShowStoryForm(false)
    setShowCreateMenu(false)
  }

  const handleReelCreated = () => {
    setShowReelForm(false)
    setShowCreateMenu(false)
  }

  // Handler de logout
  const handleLogout = async () => {
    try {
      onLogout?.()
      router.push('/')
      logger.info('User logged out successfully')
    } catch (logoutError) {
      logger.error('Error during logout:', {
        error: logoutError instanceof Error ? logoutError.message : 'Unknown error'
      })
    }
  }

  return {
    // Estados de búsqueda
    searchQuery,
    searchFocused,
    showSearch,
    searchRef,

    // Estados de menús
    mobileMenuOpen,
    showCreateMenu,
    showUserMenu,
    userMenuRef,

    // Estados de modales
    showPostForm,
    showStoryForm,
    showReelForm,

    // Setters
    setSearchQuery,
    setSearchFocused,
    setShowSearch,
    setMobileMenuOpen,
    setShowCreateMenu,
    setShowUserMenu,
    setShowPostForm,
    setShowStoryForm,
    setShowReelForm,

    // Handlers
    handleSearchSubmit,
    handlePostCreated,
    handleStoryCreated,
    handleReelCreated,
    handleLogout,
    closeAllMenus,
  }
}


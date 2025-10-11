/**
 * Setup Global para Tests - Frontend
 *
 * Este archivo se ejecuta antes de todos los tests
 * para configurar el entorno de testing.
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// ========================================
// Configuración de Variables de Entorno
// ========================================

// NO usar hardcode - configurar env vars para tests
// NODE_ENV ya está configurado como 'test' por Vitest automáticamente

process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
process.env.NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001'
process.env.NEXT_PUBLIC_APP_NAME = 'CircleSfera Test'
process.env.NEXT_PUBLIC_MAX_FILE_SIZE = '10485760'
process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES = 'image/jpeg,image/png,video/mp4'

// ========================================
// Cleanup Automático
// ========================================

// Cleanup después de cada test
afterEach(() => {
  cleanup()
})

// ========================================
// Mock de Window APIs
// ========================================

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock de sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
})

// Mock de matchMedia (para responsive design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  takeRecords() {
    return []
  }
  unobserve() { }
} as any

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
} as any

// Mock de fetch (será sobrescrito por MSW en tests específicos)
global.fetch = vi.fn()

// ========================================
// Mock de Next.js Router
// ========================================

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// ========================================
// Mock de next/image
// ========================================

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => props,
}))

// ========================================
// Helpers Globales para Tests
// ========================================

/**
 * Helper para crear mock de usuario
 */
export const createMockUser = (overrides = {}) => ({
  _id: `user_${Date.now()}`,
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  fullName: 'Test User',
  avatar: '/default-avatar.png',
  bio: 'Test bio',
  isVerified: false,
  followers: [],
  following: [],
  ...overrides
})

/**
 * Helper para crear mock de post
 */
export const createMockPost = (overrides = {}) => ({
  _id: `post_${Date.now()}`,
  user: createMockUser(),
  caption: 'Test caption',
  media: ['image1.jpg'],
  likes: [],
  comments: [],
  createdAt: new Date().toISOString(),
  ...overrides
})

/**
 * Helper para esperar un tiempo (para tests async)
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Helper para simular event
 */
export const createMockEvent = (overrides = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: {},
  currentTarget: {},
  ...overrides
})


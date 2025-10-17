/**
 * Tests para useAuth Hook
 *
 * Verifica que el hook de autenticación funcione correctamente
 * con login, registro, logout y gestión de estado.
 */

import { renderHook } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { AuthProvider } from '../AuthContext'
import api from '@/services/axios'
import type { ReactNode } from 'react'

// Mock del servicio API
vi.mock('@/services/axios')

// Helper waitFor
const waitFor = async (callback: () => void, timeout = 3000) => {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      callback()
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  callback() // Last attempt
}

// Helper para crear wrapper con AuthProvider
const createWrapper = () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )
  Wrapper.displayName = 'AuthTestWrapper'
  return Wrapper
}

// Mock data sin hardcode
const createMockUser = () => ({
  id: `user_${Date.now()}`,
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  fullName: 'Test User',
  avatar: '/default-avatar.png',
  bio: '',
  isVerified: false,
  followers: [],
  following: []
})

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()

    // Reset mocks
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    test('debe tener user null inicialmente', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Assert
      expect(result.current.user).toBeNull()
    })

    test('debe tener token null inicialmente', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Assert
      expect(result.current.token).toBeNull()
    })

    test('debe tener loading definido', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Assert
      expect(result.current.loading).toBeDefined()
      expect(typeof result.current.loading).toBe('boolean')
    })
  })

  describe('Métodos disponibles', () => {
    test('debe tener método login', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Assert
      expect(result.current.login).toBeDefined()
      expect(typeof result.current.login).toBe('function')
    })

    test('debe tener método register', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Assert
      expect(result.current.register).toBeDefined()
      expect(typeof result.current.register).toBe('function')
    })

    test('debe tener método logout', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Assert
      expect(result.current.logout).toBeDefined()
      expect(typeof result.current.logout).toBe('function')
    })

    test('debe tener método refreshUser', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Assert
      expect(result.current.refreshUser).toBeDefined()
      expect(typeof result.current.refreshUser).toBe('function')
    })
  })

  describe('Login', () => {
    test('debe actualizar user y token después del login exitoso', async () => {
      // Arrange
      const mockUser = createMockUser()
      const mockToken = 'mock-jwt-token'

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          token: mockToken,
          refreshToken: 'mock-refresh-token',
          user: mockUser
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Act
      await result.current.login(mockUser.email, 'Password123!')

      // Assert
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.token).toBe(mockToken)
        expect(result.current.loading).toBe(false)
      })
    })

    test('debe guardar token en localStorage', async () => {
      // Arrange
      const mockUser = createMockUser()
      const mockToken = 'mock-jwt-token'

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          token: mockToken,
          refreshToken: 'mock-refresh-token',
          user: mockUser
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Act
      await result.current.login(mockUser.email, 'Password123!')

      // Assert
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe(mockToken)
      })
    })

    test('debe guardar user en localStorage', async () => {
      // Arrange
      const mockUser = createMockUser()

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          token: 'mock-token',
          refreshToken: 'mock-refresh',
          user: mockUser
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Act
      await result.current.login(mockUser.email, 'Password123!')

      // Assert
      await waitFor(() => {
        const storedUser = localStorage.getItem('user')
        expect(storedUser).toBeDefined()
        expect(JSON.parse(storedUser as string)).toEqual(mockUser)
      })
    })
  })

  describe('Logout', () => {
    test('debe limpiar user y token', async () => {
      // Arrange
      const mockUser = createMockUser()

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          token: 'mock-token',
          refreshToken: 'mock-refresh',
          user: mockUser
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Login first
      await result.current.login(mockUser.email, 'Password123!')

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Act
      result.current.logout()

      // Assert
      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
      })
    })

    test('debe limpiar localStorage', async () => {
      // Arrange
      const mockUser = createMockUser()

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          token: 'mock-token',
          refreshToken: 'mock-refresh',
          user: mockUser
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Login first
      await result.current.login(mockUser.email, 'Password123!')

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeDefined()
      })

      // Act
      result.current.logout()

      // Assert
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('Manejo de errores', () => {
    test('debe manejar error de login', async () => {
      // Arrange
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Act & Assert
      await expect(result.current.login('test@example.com', 'wrong')).rejects.toThrow()

      // User should remain null
      expect(result.current.user).toBeNull()
    })

    test('debe permanecer con loading false después de error', async () => {
      // Arrange
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Act
      try {
        await result.current.login('test@example.com', 'pass')
      } catch {
        // Expected to fail
      }

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })
})


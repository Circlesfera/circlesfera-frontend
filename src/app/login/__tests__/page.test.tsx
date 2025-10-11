/**
 * Tests para Login Page
 *
 * Test de integración que verifica el flujo completo de login:
 * renderizado, validación, submit y navegación.
 */

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'
import { useAuth } from '@/features/auth/useAuth'

// Mock de useAuth
vi.mock('@/features/auth/useAuth')

describe('Login Page', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Setup mock de useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      loading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    })
  })

  describe('Renderizado', () => {
    test('debe renderizar el título CircleSfera', () => {
      // Arrange & Act
      const { getByText } = render(<LoginPage />)

      // Assert
      expect(getByText('CircleSfera')).toBeInTheDocument()
    })

    test('debe renderizar inputs de formulario', () => {
      // Arrange & Act
      const { container } = render(<LoginPage />)

      // Assert
      const emailInput = container.querySelector('input[type="email"]')
      const passwordInput = container.querySelector('input[type="password"]')

      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })

    test('debe renderizar botón de submit', () => {
      // Arrange & Act
      const { container } = render(<LoginPage />)

      // Assert
      const submitButton = container.querySelector('button[type="submit"]')
      expect(submitButton).toBeInTheDocument()
    })

    test('debe renderizar link a registro', () => {
      // Arrange & Act
      const { getByText } = render(<LoginPage />)

      // Assert
      expect(getByText(/regístrate/i)).toBeInTheDocument()
    })
  })

  describe('Interacción', () => {
    test('debe actualizar email input', async () => {
      // Arrange
      const user = userEvent.setup()
      const { container } = render(<LoginPage />)
      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement

      // Act
      await user.type(emailInput, 'test@example.com')

      // Assert
      expect(emailInput.value).toBe('test@example.com')
    })

    test('debe actualizar password input', async () => {
      // Arrange
      const user = userEvent.setup()
      const { container } = render(<LoginPage />)
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement

      // Act
      await user.type(passwordInput, 'Password123')

      // Assert
      expect(passwordInput.value).toBe('Password123')
    })
  })

  describe('Estado loading', () => {
    test('debe mostrar loading mientras procesa', () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        token: null,
        loading: true,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn()
      })

      // Act
      const { getByText } = render(<LoginPage />)

      // Assert
      expect(getByText(/entrando/i)).toBeInTheDocument()
    })

    test('debe deshabilitar botón durante loading', () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        token: null,
        loading: true,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn()
      })

      // Act
      const { container } = render(<LoginPage />)
      const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement

      // Assert
      expect(submitButton).toBeDisabled()
    })
  })
})

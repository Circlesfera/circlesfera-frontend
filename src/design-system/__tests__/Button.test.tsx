/**
 * Tests para Button Component
 *
 * Verifica que el componente Button funcione correctamente
 * con diferentes variantes, tamaños y estados.
 */

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    test('debe renderizar correctamente', () => {
      // Arrange & Act
      const { getByRole } = render(<Button>Click me</Button>)

      // Assert
      expect(getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    test('debe renderizar con texto children', () => {
      // Arrange
      const text = 'Test Button'

      // Act
      const { getByText } = render(<Button>{text}</Button>)

      // Assert
      expect(getByText(text)).toBeInTheDocument()
    })

    test('debe ser un elemento button', () => {
      // Arrange & Act
      const { getByRole } = render(<Button>Button</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('Variantes', () => {
    test('debe aplicar variante primary por defecto', () => {
      // Arrange & Act
      const { getByRole } = render(<Button>Primary</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain('bg-blue-600')
    })

    test('debe aplicar variante secondary', () => {
      // Arrange & Act
      const { getByRole } = render(<Button variant="secondary">Secondary</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain('bg-gray-100 dark:bg-gray-700 dark:bg-gray-800')
    })

    test('debe aplicar variante destructive', () => {
      // Arrange & Act
      const { getByRole } = render(<Button variant="destructive">Delete</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain('bg-red-600')
    })
  })

  describe('Tamaños', () => {
    test('debe aplicar tamaño md por defecto', () => {
      // Arrange & Act
      const { getByRole } = render(<Button>Medium</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain('h-10')
    })

    test('debe aplicar tamaño sm', () => {
      // Arrange & Act
      const { getByRole } = render(<Button size="sm">Small</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain('h-8')
    })

    test('debe aplicar tamaño lg', () => {
      // Arrange & Act
      const { getByRole } = render(<Button size="lg">Large</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain('h-12')
    })
  })

  describe('Estados', () => {
    test('debe estar deshabilitado cuando disabled=true', () => {
      // Arrange & Act
      const { getByRole } = render(<Button disabled>Disabled</Button>)

      // Assert
      const button = getByRole('button')
      expect(button).toBeDisabled()
    })

    test('debe mostrar estado loading', () => {
      // Arrange & Act
      const { getByRole } = render(<Button loading>Loading</Button>)

      // Assert
      const button = getByRole('button')
      expect(button).toBeDisabled()
    })

    test('debe estar habilitado por defecto', () => {
      // Arrange & Act
      const { getByRole } = render(<Button>Enabled</Button>)

      // Assert
      const button = getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Interacciones', () => {
    test('debe ejecutar onClick cuando se hace click', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClick = vi.fn()
      const { getByRole } = render(<Button onClick={handleClick}>Click</Button>)

      // Act
      await user.click(getByRole('button'))

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('no debe ejecutar onClick cuando está disabled', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClick = vi.fn()
      const { getByRole } = render(<Button onClick={handleClick} disabled>Disabled</Button>)

      // Act
      await user.click(getByRole('button'))

      // Assert
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Full Width', () => {
    test('no debe tener fullWidth por defecto', () => {
      // Arrange & Act
      const { getByRole } = render(<Button>Button</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).not.toContain('w-full')
    })

    test('debe aplicar fullWidth cuando es true', () => {
      // Arrange & Act
      const { getByRole } = render(<Button fullWidth>Full Width</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain('w-full')
    })
  })

  describe('Custom Props', () => {
    test('debe aceptar className personalizado', () => {
      // Arrange
      const customClass = 'custom-test-class'

      // Act
      const { getByRole } = render(<Button className={customClass}>Button</Button>)

      // Assert
      const button = getByRole('button')
      expect(button.className).toContain(customClass)
    })

    test('debe aceptar type submit', () => {
      // Arrange & Act
      const { getByRole } = render(<Button type="submit">Submit</Button>)

      // Assert
      const button = getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })
})

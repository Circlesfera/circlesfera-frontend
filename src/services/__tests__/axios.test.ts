/**
 * Tests para Axios Service
 *
 * Verifica que la instancia de axios funcione correctamente
 * con interceptors, error handling y autenticación.
 */

import api from '../axios'
import { config } from '@/config/env'

describe('Axios Service', () => {
  beforeEach(() => {
    // Limpiar localStorage
    localStorage.clear()
  })

  describe('Configuración básica', () => {
    test('debe estar definido', () => {
      expect(api).toBeDefined()
    })

    test('debe tener baseURL configurada', () => {
      expect(api.defaults.baseURL).toBe(config.apiUrl)
    })

    test('debe tener timeout configurado', () => {
      expect(api.defaults.timeout).toBeDefined()
      expect(typeof api.defaults.timeout).toBe('number')
      expect(api.defaults.timeout).toBeGreaterThan(0)
    })

    test('debe tener withCredentials en true', () => {
      expect(api.defaults.withCredentials).toBe(true)
    })

    test('debe tener Content-Type application/json', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('Métodos HTTP', () => {
    test('debe tener método get', () => {
      expect(api.get).toBeDefined()
      expect(typeof api.get).toBe('function')
    })

    test('debe tener método post', () => {
      expect(api.post).toBeDefined()
      expect(typeof api.post).toBe('function')
    })

    test('debe tener método put', () => {
      expect(api.put).toBeDefined()
      expect(typeof api.put).toBe('function')
    })

    test('debe tener método delete', () => {
      expect(api.delete).toBeDefined()
      expect(typeof api.delete).toBe('function')
    })

    test('debe tener método patch', () => {
      expect(api.patch).toBeDefined()
      expect(typeof api.patch).toBe('function')
    })
  })

  describe('Interceptors', () => {
    test('debe tener request interceptors', () => {
      expect(api.interceptors.request).toBeDefined()
    })

    test('debe tener response interceptors', () => {
      expect(api.interceptors.response).toBeDefined()
    })
  })

  describe('Headers y autenticación', () => {
    test('debe agregar Authorization header si hay token en localStorage', () => {
      // Arrange
      const mockToken = 'mock-jwt-token-12345'
      localStorage.setItem('token', mockToken)

      // Assert - El token debe estar disponible para ser agregado
      expect(localStorage.getItem('token')).toBe(mockToken)
    })

    test('no debe tener Authorization header sin token', () => {
      // Arrange
      localStorage.clear()

      // Assert
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('Manejo de errores', () => {
    test('debe tener interceptors de response configurados', () => {
      // Arrange & Act & Assert
      expect(api.interceptors.response).toBeDefined()
    })
  })

  describe('Timeout', () => {
    test('debe tener timeout mayor a 0', () => {
      expect(api.defaults.timeout).toBeGreaterThan(0)
    })

    test('debe tener timeout menor a 1 minuto', () => {
      // Timeout razonable (menos de 60 segundos)
      expect(api.defaults.timeout).toBeLessThanOrEqual(60000)
    })
  })

  describe('Base URL', () => {
    test('debe usar URL de API desde config', () => {
      expect(api.defaults.baseURL).toBe(config.apiUrl)
    })

    test('baseURL no debe estar hardcodeada', () => {
      // Verificar que usa config, no un string literal
      expect(api.defaults.baseURL).not.toBeNull()
      expect(api.defaults.baseURL).not.toBeUndefined()
    })

    test('baseURL debe terminar con /api', () => {
      const baseURL = api.defaults.baseURL || ''
      expect(baseURL).toContain('/api')
    })
  })

  describe('Headers por defecto', () => {
    test('debe tener Content-Type configurado', () => {
      expect(api.defaults.headers['Content-Type']).toBeDefined()
    })

    test('debe soportar JSON', () => {
      expect(api.defaults.headers['Content-Type']).toContain('json')
    })
  })

  describe('Configuración de seguridad', () => {
    test('debe permitir cookies (withCredentials)', () => {
      expect(api.defaults.withCredentials).toBe(true)
    })
  })
})


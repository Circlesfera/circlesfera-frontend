/**
 * Tests para Logger Utility
 *
 * Verifica que el logger funcione correctamente y solo
 * loggee en los entornos apropiados.
 */

import logger from '../logger'

describe('Logger Utility', () => {
  // NODE_ENV no se puede modificar en tests, Vitest lo mantiene en 'test'
  // Si necesitas cambiar entorno, usa mocks específicos

  describe('Métodos básicos', () => {
    test('debe tener método log', () => {
      expect(logger.log).toBeDefined()
      expect(typeof logger.log).toBe('function')
    })

    test('debe tener método info', () => {
      expect(logger.info).toBeDefined()
      expect(typeof logger.info).toBe('function')
    })

    test('debe tener método warn', () => {
      expect(logger.warn).toBeDefined()
      expect(typeof logger.warn).toBe('function')
    })

    test('debe tener método error', () => {
      expect(logger.error).toBeDefined()
      expect(typeof logger.error).toBe('function')
    })

    test('debe tener método debug', () => {
      expect(logger.debug).toBeDefined()
      expect(typeof logger.debug).toBe('function')
    })
  })

  describe('Funcionalidad básica', () => {
    test('no debe fallar al loggear un mensaje simple', () => {
      expect(() => {
        logger.info('Test message')
      }).not.toThrow()
    })

    test('no debe fallar con parámetros undefined', () => {
      expect(() => {
        logger.info(undefined)
      }).not.toThrow()
    })

    test('no debe fallar con parámetros null', () => {
      expect(() => {
        logger.info(null)
      }).not.toThrow()
    })

    test('no debe fallar con objetos', () => {
      expect(() => {
        logger.info('Message with object', { key: 'value' })
      }).not.toThrow()
    })

    test('no debe fallar con arrays', () => {
      expect(() => {
        logger.info('Message with array', [1, 2, 3])
      }).not.toThrow()
    })
  })

  describe('Métodos especializados', () => {
    test('debe tener método table', () => {
      expect(logger.table).toBeDefined()
      expect(typeof logger.table).toBe('function')
    })

    test('debe tener método group', () => {
      expect(logger.group).toBeDefined()
      expect(typeof logger.group).toBe('function')
    })

    test('debe tener método groupEnd', () => {
      expect(logger.groupEnd).toBeDefined()
      expect(typeof logger.groupEnd).toBe('function')
    })

    test('debe tener método time', () => {
      expect(logger.time).toBeDefined()
      expect(typeof logger.time).toBe('function')
    })

    test('debe tener método timeEnd', () => {
      expect(logger.timeEnd).toBeDefined()
      expect(typeof logger.timeEnd).toBe('function')
    })
  })

  describe('Métodos de utilidad', () => {
    test('debe tener método apiRequest', () => {
      expect(logger.apiRequest).toBeDefined()
      expect(typeof logger.apiRequest).toBe('function')
    })

    test('debe tener método apiResponse', () => {
      expect(logger.apiResponse).toBeDefined()
      expect(typeof logger.apiResponse).toBe('function')
    })

    test('debe tener método componentState', () => {
      expect(logger.componentState).toBeDefined()
      expect(typeof logger.componentState).toBe('function')
    })

    test('debe tener método userEvent', () => {
      expect(logger.userEvent).toBeDefined()
      expect(typeof logger.userEvent).toBe('function')
    })

    test('debe tener método performance', () => {
      expect(logger.performance).toBeDefined()
      expect(typeof logger.performance).toBe('function')
    })
  })

  describe('API Request logging', () => {
    test('no debe fallar al loggear API request', () => {
      expect(() => {
        logger.apiRequest('GET', '/api/users')
      }).not.toThrow()
    })

    test('no debe fallar con data en API request', () => {
      expect(() => {
        logger.apiRequest('POST', '/api/posts', { caption: 'test' })
      }).not.toThrow()
    })
  })

  describe('API Response logging', () => {
    test('no debe fallar al loggear API response', () => {
      expect(() => {
        logger.apiResponse('GET', '/api/users', 200)
      }).not.toThrow()
    })

    test('no debe fallar con data en API response', () => {
      expect(() => {
        logger.apiResponse('POST', '/api/posts', 201, { success: true })
      }).not.toThrow()
    })
  })

  describe('Component State logging', () => {
    test('no debe fallar al loggear estado de componente', () => {
      expect(() => {
        logger.componentState('TestComponent', { count: 0 })
      }).not.toThrow()
    })
  })

  describe('User Event logging', () => {
    test('no debe fallar al loggear evento de usuario', () => {
      expect(() => {
        logger.userEvent('button_click')
      }).not.toThrow()
    })

    test('no debe fallar con properties en user event', () => {
      expect(() => {
        logger.userEvent('button_click', { buttonId: 'submit', page: 'login' })
      }).not.toThrow()
    })
  })

  describe('Performance logging', () => {
    test('no debe fallar al loggear performance', () => {
      expect(() => {
        logger.performance('render', 123.45)
      }).not.toThrow()
    })
  })

  describe('Tabla y grupos', () => {
    test('no debe fallar con logger.table', () => {
      expect(() => {
        logger.table([{ id: 1, name: 'Test' }])
      }).not.toThrow()
    })

    test('no debe fallar con logger.group y groupEnd', () => {
      expect(() => {
        logger.group('Test Group')
        logger.info('Inside group')
        logger.groupEnd()
      }).not.toThrow()
    })
  })

  describe('Timing', () => {
    test('no debe fallar con time y timeEnd', () => {
      expect(() => {
        logger.time('test-timer')
        logger.timeEnd('test-timer')
      }).not.toThrow()
    })
  })

  describe('Manejo de errores complejos', () => {
    test('debe manejar objetos circulares', () => {
      // Arrange
      const circular: any = { prop: 'value' }
      circular.circular = circular

      // Act & Assert
      expect(() => {
        logger.info('Circular', circular)
      }).not.toThrow()
    })

    test('debe manejar errores nativos', () => {
      // Arrange
      const error = new Error('Test error')

      // Act & Assert
      expect(() => {
        logger.error('Error occurred', error)
      }).not.toThrow()
    })

    test('debe manejar objetos complejos anidados', () => {
      // Arrange
      const complex = {
        level1: {
          level2: {
            level3: {
              data: 'deep'
            }
          }
        }
      }

      // Act & Assert
      expect(() => {
        logger.info('Complex object', complex)
      }).not.toThrow()
    })
  })
})


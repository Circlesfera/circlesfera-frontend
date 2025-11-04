import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Ejecutar tests en archivos en paralelo */
  fullyParallel: true,
  
  /* Falla el build en CI si dejas tests arbitrariamente excluidos */
  forbidOnly: !!process.env.CI,
  
  /* Reintentar en CI solo */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers en CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter a usar */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  
  /* Configuración compartida para todos los proyectos */
  use: {
    /* Base URL para navegar */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace cuando se retry el test fallido. Ver https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot en caso de fallo */
    screenshot: 'only-on-failure',
    
    /* Video en caso de fallo */
    video: 'retain-on-failure'
  },

  /* Configurar proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    /* Tests en dispositivos móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  /* Ejecutar el servidor de desarrollo local antes de los tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});


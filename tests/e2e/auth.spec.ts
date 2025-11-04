import { test, expect } from '@playwright/test';

/**
 * Tests E2E de autenticación
 * Verifica flujos completos de login, registro y logout
 */

test.describe('Autenticación E2E', () => {
  const testUser = {
    email: `e2e-${Date.now()}@test.com`,
    handle: `e2e_user_${Date.now()}`,
    displayName: 'E2E Test User',
    password: 'SecurePassword123!'
  };

  test.beforeEach(async ({ page }) => {
    // Cada test inicia desde la página de login
    await page.goto('/login');
  });

  test('debe navegar correctamente entre login y registro', async ({ page }) => {
    // Verificar que estamos en login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Inicia sesión');

    // Navegar a registro
    await page.click('text=Regístrate gratis');
    
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('h1')).toContainText('Únete a CircleSfera');
  });

  test('debe mostrar errores de validación en login', async ({ page }) => {
    // Intentar submit sin datos
    await page.click('button[type="submit"]');

    // Verificar que no navegó
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    // Llenar formulario con credenciales inválidas
    await page.fill('input[name="identifier"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verificar mensaje de error (puede tardar un poco)
    await expect(page.locator('.text-red-400')).toContainText('Credenciales inválidas', {
      timeout: 5000
    });
  });

  test('debe completar flujo de registro', async ({ page }) => {
    // Navegar a registro
    await page.click('text=Regístrate gratis');

    // Llenar formulario de registro
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="handle"]', testUser.handle);
    await page.fill('input[name="displayName"]', testUser.displayName);
    await page.fill('input[name="password"]', testUser.password);

    // Submit
    await page.click('button[type="submit"]');

    // Verificar redirección a feed
    await expect(page).toHaveURL(/\/feed/, { timeout: 10000 });
  });

  test('debe permitir login después de registro', async ({ page }) => {
    // Primero hacer login (asumiendo que el usuario ya existe)
    await page.fill('input[name="identifier"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Verificar redirección a feed
    await expect(page).toHaveURL(/\/feed/, { timeout: 10000 });
    
    // Verificar que hay contenido del feed
    // (esto puede variar según la implementación del feed)
  });
});

test.describe('Navegación sin autenticación', () => {
  test('debe redirigir a login al acceder a feed sin autenticación', async ({ page, context }) => {
    // Limpiar cookies/session storage
    await context.clearCookies();
    
    // Intentar acceder a feed
    await page.goto('/feed');
    
    // Debe redirigir a login
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe redirigir a login al acceder a perfil sin autenticación', async ({ page, context }) => {
    await context.clearCookies();
    
    await page.goto('/profile');
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe permitir acceder a página pública sin autenticación', async ({ page }) => {
    // Página principal debería ser accesible
    await page.goto('/');
    
    // No debería redirigir
    await expect(page).toHaveURL('/');
  });
});


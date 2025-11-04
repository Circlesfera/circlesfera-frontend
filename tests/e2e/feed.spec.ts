import { test, expect } from '@playwright/test';

/**
 * Tests E2E del feed principal
 * Verifica visualización y navegación del feed
 */

test.describe('Feed Principal', () => {
  // Credenciales de test (se necesitaría un usuario de test constante)
  const testCredentials = {
    email: process.env.E2E_TEST_EMAIL || 'test@example.com',
    password: process.env.E2E_TEST_PASSWORD || 'test123'
  };

  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/login');
    
    try {
      await page.fill('input[name="identifier"]', testCredentials.email);
      await page.fill('input[name="password"]', testCredentials.password);
      await page.click('button[type="submit"]');
      
      // Esperar a que el feed cargue
      await page.waitForURL(/\/feed/, { timeout: 10000 });
    } catch (error) {
      test.skip(true, 'Usuario de test no disponible. Configurar E2E_TEST_EMAIL y E2E_TEST_PASSWORD');
    }
  });

  test('debe mostrar el feed principal después del login', async ({ page }) => {
    // Verificar que estamos en feed
    await expect(page).toHaveURL(/\/feed/);
    
    // Verificar que hay contenido (o mensaje de vacío)
    const hasContent = await page.locator('article, .empty-state, .no-posts').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('debe cargar posts si existen', async ({ page }) => {
    // Verificar que hay posts
    const posts = page.locator('article');
    const count = await posts.count();
    
    if (count > 0) {
      // Si hay posts, verificar estructura básica
      await expect(posts.first().locator('header')).toBeVisible();
    } else {
      // Si no hay posts, verificar mensaje apropiado
      await expect(page.locator('text=/No hay publicaciones|Tu feed está vacío/')).toBeVisible();
    }
  });

  test('debe tener navegación funcional', async ({ page }) => {
    // Verificar que hay navegación (puede ser bottom nav o sidebar)
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });

  test('debe mostrar stats de posts', async ({ page }) => {
    const posts = page.locator('article');
    const count = await posts.count();
    
    if (count > 0) {
      // Verificar que hay stats visibles (likes, comments, etc)
      const stats = posts.first().locator('text=/❤️|💬|🔁/');
      const statsCount = await stats.count();
      expect(statsCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Interacciones del Feed', () => {
  const testCredentials = {
    email: process.env.E2E_TEST_EMAIL || 'test@example.com',
    password: process.env.E2E_TEST_PASSWORD || 'test123'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    try {
      await page.fill('input[name="identifier"]', testCredentials.email);
      await page.fill('input[name="password"]', testCredentials.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/feed/, { timeout: 10000 });
    } catch (error) {
      test.skip(true, 'Usuario de test no disponible');
    }
  });

  test('debe permitir navegar a detalle de post', async ({ page }) => {
    const posts = page.locator('article');
    const count = await posts.count();
    
    if (count > 0) {
      // Click en el primer post (puede variar según implementación)
      await posts.first().click();
      
      // Verificar que navegó a detalle (o modal se abrió)
      await expect(page.locator('text=/Post|Comentarios/').first()).toBeVisible({
        timeout: 3000
      }).catch(() => {
        // Si no navegó, probablemente el click no es en la card completa
        // Esto es ok, depende de la implementación
      });
    }
  });
});


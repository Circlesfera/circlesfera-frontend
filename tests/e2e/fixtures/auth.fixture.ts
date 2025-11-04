/**
 * Fixtures para tests E2E de autenticación
 */

export const E2E_TEST_CREDENTIALS = {
  email: process.env.E2E_TEST_EMAIL || 'e2e@test.com',
  password: process.env.E2E_TEST_PASSWORD || 'Password123!',
  handle: process.env.E2E_TEST_HANDLE || 'e2e_user',
  displayName: 'E2E Test User'
};

/**
 * Helper para hacer login en tests E2E
 */
export async function loginAsTestUser(page: any) {
  await page.goto('/login');
  await page.fill('input[name="identifier"]', E2E_TEST_CREDENTIALS.email);
  await page.fill('input[name="password"]', E2E_TEST_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/feed/, { timeout: 10000 });
}

/**
 * Helper para logout
 */
export async function logout(page: any) {
  // Click en menu de usuario
  await page.click('[data-testid="user-menu"], button[aria-label*="user"]').catch(() => {
    // Si no existe el testid, intentar otros selectores
  });
  
  // Click en logout
  await page.click('[data-testid="logout-button"], text=Salir').catch(() => {
    // Si no se encuentra, navegar a logout manualmente
    page.goto('/logout');
  });
  
  await page.waitForURL(/\/login/, { timeout: 5000 });
}


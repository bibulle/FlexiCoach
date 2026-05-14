import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Connexion');
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/signup');

    // Fill registration form
    await page.fill('input[id="displayName"]', testName);
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to home/routines after successful registration
    await expect(page).toHaveURL('/');
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    await page.goto('/signup');
    const email = `test-login-${Date.now()}@example.com`;
    await page.fill('input[id="displayName"]', 'Login Test');
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Logout
    await page.click(
      'button:has-text("Déconnexion"), a:has-text("Déconnexion")',
    );
    await expect(page).toHaveURL('/login');

    // Login with same credentials
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', 'nonexistent@example.com');
    await page.fill('input[id="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', 'invalid-email');
    await page.fill('input[id="password"]', 'somepassword');

    // Button should be disabled with invalid email
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should validate password confirmation on signup', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="confirmPassword"]', 'differentpassword');

    // Trigger validation by clicking outside
    await page.locator('input[id="confirmPassword"]').blur();

    // Should show error about password mismatch
    await expect(page.locator('.field-error')).toContainText(
      'ne correspondent pas',
    );
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login first
    await page.goto('/signup');
    const email = `test-logout-${Date.now()}@example.com`;
    await page.fill('input[id="displayName"]', 'Logout Test');
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Logout
    await page.click(
      'button:has-text("Déconnexion"), a:has-text("Déconnexion")',
    );

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing protected route', async ({
    page,
  }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access admin page
    await page.goto('/admin');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

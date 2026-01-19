import { test, expect } from '@playwright/test';

test.describe('Navigation and Header', () => {
  const testEmail = `navtest-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Nav Test User';

  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto('/signup');
    await page.fill('input[id="displayName"]', testName);
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test.describe('Header and Logo', () => {
    test('should display header on all authenticated pages', async ({ page }) => {
      // Check on home page
      await expect(page.locator('.app-header')).toBeVisible();
      await expect(page.locator('.logo-text')).toContainText('FlexiCoach');

      // Navigate to calendar
      await page.goto('/calendar');
      await expect(page.locator('.app-header')).toBeVisible();
      await expect(page.locator('.logo-text')).toContainText('FlexiCoach');
    });

    test('should redirect to home when logo is clicked', async ({ page }) => {
      // Navigate to calendar
      await page.goto('/calendar');
      await expect(page).toHaveURL('/calendar');

      // Click logo
      await page.click('.logo');
      await page.waitForURL('/');
      await expect(page).toHaveURL('/');
    });

    test('should display navigation links', async ({ page }) => {
      const routinesLink = page.locator('.nav-link', { hasText: 'Routines' });
      await expect(routinesLink).toBeVisible();
    });
  });

  test.describe('User Menu', () => {
    test('should display user name in header', async ({ page }) => {
      const userMenu = page.locator('.user-menu');
      await expect(userMenu).toBeVisible();

      // Should display the user name or email
      const userName = page.locator('.user-name');
      await expect(userName).toBeVisible();
      const userNameText = await userName.textContent();
      expect(userNameText).toBeTruthy();
    });

    test('should display user initials in avatar', async ({ page }) => {
      const avatar = page.locator('.user-avatar');
      await expect(avatar).toBeVisible();

      const avatarText = await avatar.textContent();
      expect(avatarText?.length).toBeGreaterThan(0);
    });

    test('should open menu dropdown on click', async ({ page }) => {
      // Initially, dropdown should not be visible
      await expect(page.locator('.user-menu-dropdown')).not.toBeVisible();

      // Click user menu trigger
      await page.click('.user-menu-trigger');

      // Dropdown should now be visible
      await expect(page.locator('.user-menu-dropdown')).toBeVisible();
      await expect(page.locator('.user-email')).toBeVisible();
      await expect(page.locator('.menu-item')).toContainText('Déconnexion');
    });

    test('should logout when clicking logout button', async ({ page }) => {
      // Open user menu
      await page.click('.user-menu-trigger');

      // Click logout
      await page.click('.menu-item:has-text("Déconnexion")');

      // Should redirect to login page
      await page.waitForURL('/login');
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Breadcrumbs', () => {
    test('should not display breadcrumbs on home page', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.breadcrumbs')).not.toBeVisible();
    });

    test('should display breadcrumbs on calendar page', async ({ page }) => {
      await page.goto('/calendar');

      const breadcrumbs = page.locator('.breadcrumbs');
      await expect(breadcrumbs).toBeVisible();

      // Should have "Routines" link
      const routinesLink = breadcrumbs.locator('.breadcrumb-link:has-text("Routines")');
      await expect(routinesLink).toBeVisible();

      // Should have current page indicator
      const current = breadcrumbs.locator('.current:has-text("Calendrier")');
      await expect(current).toBeVisible();

      // Should have separator
      await expect(breadcrumbs.locator('.separator')).toBeVisible();
    });

    test('should navigate via breadcrumbs', async ({ page }) => {
      await page.goto('/calendar');
      await expect(page).toHaveURL('/calendar');

      // Click "Routines" breadcrumb
      await page.click('.breadcrumb-link:has-text("Routines")');
      await page.waitForURL('/');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Navigation Consistency', () => {
    test('should maintain header across all pages', async ({ page }) => {
      const pages = ['/', '/calendar'];

      for (const url of pages) {
        await page.goto(url);
        await expect(page.locator('.app-header')).toBeVisible();
        await expect(page.locator('.logo-text')).toContainText('FlexiCoach');
        await expect(page.locator('.user-menu')).toBeVisible();
      }
    });

    test('should not display user menu on login page', async ({ page }) => {
      // Logout first
      await page.click('.user-menu-trigger');
      await page.click('.menu-item:has-text("Déconnexion")');
      await page.waitForURL('/login');

      // User menu should not be visible
      await expect(page.locator('.user-menu')).not.toBeVisible();
    });
  });
});

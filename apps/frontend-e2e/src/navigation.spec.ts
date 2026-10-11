import { test, expect } from '@playwright/test';
import {
  AuthSession,
  loginAs,
  navLink,
  openUserMenu,
  registerViaApi,
  routineCard,
} from './support/helpers';

test.describe('Navigation and Header', () => {
  let session: AuthSession;

  test.beforeEach(async ({ page, request }) => {
    session = await registerViaApi(request, 'nav', 'Marie Curie');
    await loginAs(page, session);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Marie');
  });

  test.describe('Header and Logo', () => {
    test('should display header on all authenticated pages', async ({
      page,
    }) => {
      for (const path of ['/', '/routines', '/calendar', '/settings']) {
        await page.goto(path);
        await expect(page.getByRole('banner')).toBeVisible();
        await expect(page.locator('app-user-menu')).toBeVisible();
      }
    });

    test('should redirect to home when logo is clicked', async ({ page }) => {
      await page.goto('/calendar');
      await page.getByRole('banner').getByRole('link', { name: /FlexiCoach/ }).click();

      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: 'Tes routines' })).toBeVisible();
    });

    test('should display navigation links', async ({ page }) => {
      const pages: Array<[string, string, RegExp]> = [
        ['Routines', '/routines', /Routines\./],
        ['Calendrier', '/calendar', /séances?\./],
        ['Paramètres', '/settings', /Tes 30 derniers jours\./],
        ['Accueil', '/', /Marie/],
      ];

      for (const [label, url, heading] of pages) {
        await navLink(page, label).click();
        await expect(page).toHaveURL(url);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      }
    });
  });

  test.describe('User Menu', () => {
    test('should display user name in header', async ({ page }) => {
      await expect(page.locator('app-user-menu')).toContainText('Marie Curie');
    });

    test('should display user initials in avatar', async ({ page }) => {
      await expect(page.locator('app-user-menu .user-avatar')).toHaveText('MC');
    });

    test('should open menu dropdown on click', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Déconnexion' })).toHaveCount(0);

      await openUserMenu(page);

      await expect(page.locator('app-user-menu')).toContainText(session.user.email);
      await expect(page.getByRole('button', { name: 'Déconnexion' })).toBeVisible();
      // Regular users have no admin mode
      await expect(
        page.getByRole('button', { name: /Mode administration/ }),
      ).toHaveCount(0);
    });

    test('should logout when clicking logout button', async ({ page }) => {
      await openUserMenu(page);
      await page.getByRole('button', { name: 'Déconnexion' }).click();

      await expect(page).toHaveURL('/login');
      await expect(page.locator('app-user-menu')).toHaveCount(0);
    });
  });

  test.describe('Breadcrumbs', () => {
    test('should not display breadcrumbs on home page', async ({ page }) => {
      await expect(page.locator('.breadcrumbs')).toHaveCount(0);
    });

    test('should display breadcrumbs on calendar page', async ({ page }) => {
      // Top-level pages (calendar, settings) have no breadcrumbs, sub-pages do
      await page.goto('/calendar');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.breadcrumbs')).toHaveCount(0);

      await page.goto('/routine/douce-10min');
      await expect(page.locator('.breadcrumbs')).toContainText('Routines');
      await expect(page.locator('.breadcrumbs')).toContainText('Routine');
    });

    test('should navigate via breadcrumbs', async ({ page }) => {
      await page.goto('/routine/douce-10min');
      await expect(
        page.getByRole('heading', { name: 'Respiration profonde' }),
      ).toBeVisible();

      await page.locator('.breadcrumbs').getByRole('link', { name: 'Routines' }).click();

      await expect(page).not.toHaveURL(/\/routine\//);
      await expect(routineCard(page, 'Routine douce')).toBeVisible();
    });
  });

  test.describe('Navigation Consistency', () => {
    test('should maintain header across all pages', async ({ page }) => {
      for (const label of ['Routines', 'Calendrier', 'Paramètres', 'Accueil']) {
        await navLink(page, label).click();
        for (const link of ['Accueil', 'Routines', 'Calendrier', 'Paramètres']) {
          await expect(navLink(page, link)).toBeVisible();
        }
      }
    });

    test('should not display user menu on login page', async ({ page }) => {
      await openUserMenu(page);
      await page.getByRole('button', { name: 'Déconnexion' }).click();
      await expect(page).toHaveURL('/login');

      await expect(page.locator('app-user-menu')).toHaveCount(0);
      await expect(navLink(page, 'Routines')).toHaveCount(0);
    });
  });
});

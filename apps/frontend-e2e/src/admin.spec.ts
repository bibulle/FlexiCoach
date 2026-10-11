import { test, expect, Page } from '@playwright/test';
import {
  ADMIN_EMAIL,
  API_URL,
  AuthSession,
  adminSession,
  enableAdminMode,
  loginAs,
  navLink,
  openUserMenu,
  registerViaApi,
  routineCard,
  pageTitle,
} from './support/helpers';

/** Card of a user in the administration list. */
function userCard(page: Page, email: string) {
  return page.locator('.user-card').filter({ hasText: email });
}

test.describe('Admin Panel Flow', () => {
  let user: AuthSession;

  test.beforeEach(async ({ page, request }) => {
    user = await registerViaApi(request, 'admin-target', 'Utilisateur Cible');
    await loginAs(page, await adminSession(request));
    await enableAdminMode(page);
    await navLink(page, 'Admin').click();
    await expect(page).toHaveURL('/admin');
  });

  test('should access admin panel with admin account', async ({ page }) => {
    await expect(pageTitle(page, 'Administration')).toBeVisible();
    await expect(page.getByText('Gestion des utilisateurs')).toBeVisible();
    await expect(page.locator('.breadcrumbs')).toContainText('Administration');
  });

  test('should display list of users', async ({ page }) => {
    await expect(userCard(page, ADMIN_EMAIL)).toBeVisible();
    await expect(userCard(page, user.user.email)).toBeVisible();
  });

  test('should display user information columns', async ({ page }) => {
    const card = userCard(page, user.user.email);
    await expect(card.locator('strong')).toHaveText('Utilisateur Cible');
    await expect(card.locator('.user-email')).toHaveText(user.user.email);
  });

  test('should show reset password button for users', async ({ page }) => {
    await expect(
      userCard(page, user.user.email).getByRole('button', {
        name: 'Réinitialiser le mot de passe',
      }),
    ).toBeEnabled();
  });

  test('should show confirmation dialog for password reset', async ({
    page,
    request,
  }) => {
    await userCard(page, user.user.email)
      .getByRole('button', { name: 'Réinitialiser le mot de passe' })
      .click();

    const modal = page.locator('.modal');
    await expect(modal.getByRole('heading')).toHaveText(
      'Réinitialiser le mot de passe',
    );
    await expect(modal).toContainText('Utilisateur Cible');
    const confirm = modal.getByRole('button', { name: 'Confirmer' });
    await expect(confirm).toBeDisabled();

    // Cancel closes the dialog without changing anything
    await modal.getByRole('button', { name: 'Annuler' }).click();
    await expect(modal).toHaveCount(0);

    // Confirm with a new password
    await userCard(page, user.user.email)
      .getByRole('button', { name: 'Réinitialiser le mot de passe' })
      .click();
    await page.locator('#newPassword').fill('ResetPassword789');
    await page.locator('.modal').getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.modal')).toHaveCount(0);

    // The user can now log in with the new password only
    const login = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: user.user.email, password: 'ResetPassword789' },
    });
    expect(login.status()).toBe(200);
    const oldLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: user.user.email, password: user.password },
    });
    expect(oldLogin.status()).toBe(401);
  });

  test('should not allow non-admin to access admin panel', async ({
    page,
    request,
  }) => {
    const regular = await registerViaApi(request, 'not-admin');
    await loginAs(page, regular);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    await openUserMenu(page);
    await expect(
      page.getByRole('button', { name: /Mode administration/ }),
    ).toHaveCount(0);
    await expect(navLink(page, 'Admin')).toHaveCount(0);

    await page.goto('/admin');
    await expect(page).toHaveURL('/');
  });

  test('should list a newly registered user', async ({ page, request }) => {
    // Replaces the former "filter or search users" test: the panel has no
    // search field, it lists every account — new ones included.
    const newcomer = await registerViaApi(request, 'newcomer', 'Nouvel Arrivant');

    await page.reload();
    await enableAdminMode(page);
    await navLink(page, 'Admin').click();

    await expect(userCard(page, newcomer.user.email)).toContainText(
      'Nouvel Arrivant',
    );
  });

  test('should display user registration dates or metadata', async ({
    page,
  }) => {
    // No registration date is displayed: every card shows the display name
    // (or the e-mail when there is none) and the e-mail.
    const cards = page.locator('.user-card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      await expect(cards.nth(i).locator('strong')).not.toBeEmpty();
      await expect(cards.nth(i).locator('.user-email')).toHaveText(/@/);
    }
  });

  test('should navigate back to main app from admin panel', async ({ page }) => {
    await navLink(page, 'Accueil').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Tes routines' })).toBeVisible();
  });

  test('Issue #35: should show admin-only buttons in admin mode and create a routine', async ({
    page,
    request,
  }) => {
    await navLink(page, 'Routines').click();
    await page.getByRole('link', { name: 'Nouvelle routine' }).click();
    await expect(page).toHaveURL('/routines/new');

    const name = `Routine admin ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Nom de la routine' }).fill(name);
    await page.locator('.editor-add-btn').click();
    await page.locator('#step-name').fill('Gainage');
    await page.locator('#step-seconds').fill('45');
    await page.locator('#step-mode').selectOption('statique');
    await page.locator('#step-text').fill('Corps aligné');
    await page.locator('.btn-save').click();

    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.locator('.editor-alert--success')).toHaveText(
      'Routine créée avec succès',
    );
    await expect(page).toHaveURL('/routines');
    await expect(routineCard(page, name)).toBeVisible();

    // Clean up so that the admin catalogue does not grow run after run
    const admin = await adminSession(request);
    const list = await request.get(`${API_URL}/api/routines`, {
      headers: { Authorization: `Bearer ${admin.access_token}` },
    });
    const created = (await list.json()).find((r: any) => r.name === name);
    const del = await request.delete(`${API_URL}/api/routines/${created.id}`, {
      headers: { Authorization: `Bearer ${admin.access_token}` },
    });
    expect(del.status()).toBe(204);
  });
});

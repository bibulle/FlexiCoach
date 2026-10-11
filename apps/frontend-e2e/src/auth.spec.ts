import { test, expect } from '@playwright/test';
import {
  TEST_PASSWORD,
  field,
  loginAs,
  openUserMenu,
  registerViaApi,
  uniqueEmail,
} from './support/helpers';

test.describe('Authentication Flow', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Bon retour.',
    );
    await expect(
      page.getByRole('button', { name: 'Continuer avec Google' }),
    ).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Crée ton compte.',
    );

    await field(page, 'displayName').fill('Camille');
    await field(page, 'email').fill(uniqueEmail('signup'));
    await field(page, 'password').fill(TEST_PASSWORD);
    await field(page, 'confirmPassword').fill(TEST_PASSWORD);

    const submit = page.getByRole('button', { name: 'Créer mon compte' });
    // The terms of use must be accepted first
    await expect(submit).toBeDisabled();
    await page.getByRole('checkbox').check();
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Camille',
    );
  });

  test('should login with valid credentials', async ({ page, request }) => {
    const session = await registerViaApi(request, 'login', 'Léa');

    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Bon retour.',
    );
    await field(page, 'email').fill(session.user.email);
    await field(page, 'password').fill(session.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Léa');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await field(page, 'email').fill('nonexistent@example.com');
    await field(page, 'password').fill('WrongPassword1');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.locator('.error-message').filter({ visible: true })).toContainText(
      'Invalid credentials',
    );
    await expect(page).toHaveURL('/login');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');

    await field(page, 'email').fill('invalid-email');
    await field(page, 'password').fill('somepassword');
    await field(page, 'email').blur();

    await expect(page.getByText('Email invalide').filter({ visible: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });

  test('should validate password confirmation on signup', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Crée ton compte.',
    );

    await field(page, 'displayName').fill('Camille');
    await field(page, 'email').fill('test@example.com');
    await field(page, 'password').fill(TEST_PASSWORD);
    await field(page, 'confirmPassword').fill('Different123');
    await field(page, 'confirmPassword').blur();
    await page.getByRole('checkbox').check();

    await expect(
      page
        .getByText('Les mots de passe ne correspondent pas')
        .filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Créer mon compte' }),
    ).toBeDisabled();
  });

  test('should logout successfully', async ({ page, request }) => {
    const session = await registerViaApi(request, 'logout');
    await loginAs(page, session);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await openUserMenu(page);
    await page.getByRole('button', { name: 'Déconnexion' }).click();

    await expect(page).toHaveURL('/login');
    // The session is gone: protected pages redirect to login again
    await page.goto('/routines');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing protected route', async ({
    page,
  }) => {
    for (const path of ['/routines', '/calendar', '/settings', '/admin']) {
      await page.goto(path);
      await expect(page).toHaveURL('/login');
      // Let the client-side redirect settle before the next navigation
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Bon retour.',
      );
    }
  });
});

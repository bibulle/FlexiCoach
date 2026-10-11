import { APIRequestContext, Page, expect } from '@playwright/test';

/** Backend URL (the Angular dev server proxies /api to it as well). */
export const API_URL = process.env['API_URL'] || 'http://localhost:3000';

/** Password satisfying the backend RegisterDto rules. */
export const TEST_PASSWORD = 'Password123';

/** Must be listed in the backend ADMIN_EMAILS environment variable. */
export const ADMIN_EMAIL = process.env['E2E_ADMIN_EMAIL'] || 'admin@example.com';

export interface AuthSession {
  access_token: string;
  user: { _id: string; email: string; displayName?: string };
  password: string;
}

let counter = 0;

export function uniqueEmail(label: string): string {
  counter += 1;
  return `${label}-${Date.now()}-${counter}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

/** Creates a fresh user through the API (much faster than the signup UI). */
export async function registerViaApi(
  request: APIRequestContext,
  label: string,
  displayName = 'Marc Test',
): Promise<AuthSession> {
  const res = await request.post(`${API_URL}/api/auth/register`, {
    data: { email: uniqueEmail(label), password: TEST_PASSWORD, displayName },
  });
  expect(res.status(), await res.text()).toBe(201);
  return { ...(await res.json()), password: TEST_PASSWORD };
}

/** Logs the admin in, creating the account on the first run. */
export async function adminSession(
  request: APIRequestContext,
): Promise<AuthSession> {
  const register = await request.post(`${API_URL}/api/auth/register`, {
    data: { email: ADMIN_EMAIL, password: TEST_PASSWORD, displayName: 'Admin' },
  });
  if (register.status() === 201) {
    return { ...(await register.json()), password: TEST_PASSWORD };
  }
  const login = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: ADMIN_EMAIL, password: TEST_PASSWORD },
  });
  expect(login.status(), await login.text()).toBe(200);
  return { ...(await login.json()), password: TEST_PASSWORD };
}

/** Puts the JWT in localStorage the same way AuthService does, then opens a page. */
export async function loginAs(page: Page, session: AuthSession, path = '/') {
  await page.goto('/login');
  await page.evaluate((s) => {
    localStorage.setItem('auth_token', s.access_token);
    localStorage.setItem('current_user', JSON.stringify(s.user));
  }, session);
  await page.goto(path);
}

/** Opens the user menu in the header. */
export async function openUserMenu(page: Page) {
  await page.locator('app-user-menu').getByRole('button').first().click();
}

/** Switches the admin mode on (the flag lives in memory, not in storage). */
export async function enableAdminMode(page: Page) {
  await openUserMenu(page);
  await page.getByRole('button', { name: /Mode administration/ }).click();
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Admin' }),
  ).toBeVisible();
}

/** Main navigation link in the header. */
export function navLink(page: Page, name: string) {
  return page.getByRole('navigation').getByRole('link', { name, exact: true });
}

/** Card of a routine in the catalogue (/routines) or on the home page. */
export function routineCard(page: Page, name: string) {
  return page
    .getByRole('main')
    .getByRole('button')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });
}

/** Plays a routine to the end by skipping every step, then lands on /completion. */
export async function completeRoutine(page: Page, slug: string) {
  await page.goto(`/routine/${slug}`);
  await page.getByRole('button', { name: 'Démarrer' }).click();
  const next = page.getByRole('button', { name: 'Étape suivante' });
  while (!page.url().includes('/completion')) {
    await next.click();
    await page.waitForTimeout(150);
  }
  await expect(page.getByRole('heading', { name: 'Bravo !' })).toBeVisible();
}

/**
 * Visible form field by id. The auth screens render a desktop and a mobile
 * layout, so every id exists twice in the DOM (only one is displayed).
 */
export function field(page: Page, id: string) {
  return page.locator(`#${id}`).filter({ visible: true });
}

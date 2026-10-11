import { test, expect, APIRequestContext } from '@playwright/test';
import {
  API_URL,
  AuthSession,
  completeRoutine,
  loginAs,
  navLink,
  registerViaApi,
  routineCard,
} from './support/helpers';

/** Records a completed session through the API (faster than playing it). */
async function createCompletedSession(
  request: APIRequestContext,
  session: AuthSession,
  routineId: string,
  durationSec: number,
  startAt = new Date(),
) {
  const res = await request.post(`${API_URL}/api/sessions`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    data: {
      routineId,
      startAt: startAt.toISOString(),
      durationSec,
      completed: true,
    },
  });
  expect(res.status(), await res.text()).toBe(201);
}

/** Text content of a stat tile of the home page, found by its label. */
function homeTile(page: import('@playwright/test').Page, label: string) {
  return page.locator('.stat-tile').filter({ hasText: label });
}

const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

test.describe('Stats and Calendar Flow', () => {
  let session: AuthSession;

  test.beforeEach(async ({ request }) => {
    session = await registerViaApi(request, 'stats', 'Ada');
  });

  test('should navigate to stats page', async ({ page }) => {
    await loginAs(page, session);
    await navLink(page, 'Paramètres').click();

    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Tes 30 derniers jours.',
    );
    for (const label of ['Série actuelle', 'Temps cumulé', 'Séances', 'Régularité']) {
      await expect(page.getByRole('main').first()).toContainText(label);
    }
  });

  test('should display stats summary for new user', async ({ page }) => {
    await loginAs(page, session);

    await expect(homeTile(page, 'Sessions totales')).toContainText('0');
    await expect(homeTile(page, 'Série en cours')).toContainText('0');
    await expect(homeTile(page, 'Adhérence 30j')).toContainText('0%');
  });

  test('should display calendar', async ({ page }) => {
    await loginAs(page, session, '/calendar');
    const year = new Date().getFullYear();

    await expect(page.getByText(`Année ${year}`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('0 séances.');
    await expect(
      page.getByRole('heading', { name: 'Détail jour par jour' }),
    ).toBeVisible();
    await expect(page.locator(`.heat-cell[title="${localDate()}"]`)).toHaveCount(1);
  });

  test('should navigate calendar months', async ({ page }) => {
    // The calendar is a yearly heatmap: navigation happens year by year
    await loginAs(page, session, '/calendar');
    const year = new Date().getFullYear();
    await expect(page.getByText(`Année ${year}`)).toBeVisible();

    await page.getByRole('button', { name: String(year - 1), exact: true }).click();
    await expect(page.getByText(`Année ${year - 1}`)).toBeVisible();
    await expect(page.locator(`.heat-cell[title="${year - 1}-06-15"]`)).toHaveCount(1);

    await page.getByRole('button', { name: String(year), exact: true }).click();
    await expect(page.getByText(`Année ${year}`)).toBeVisible();
  });

  test('should display stats after completing a routine', async ({ page }) => {
    await loginAs(page, session);
    await completeRoutine(page, 'bureau-5min');
    await page.getByRole('button', { name: 'Voir mon calendrier' }).click();

    await expect(page).toHaveURL('/calendar');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^1 séances?\.$/);

    await navLink(page, 'Accueil').click();
    await expect(homeTile(page, 'Sessions totales')).toContainText('1');
  });

  test('should display workout streak', async ({ page, request }) => {
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
    await createCompletedSession(request, session, 'douce-10min', 600, yesterday);
    await createCompletedSession(request, session, 'douce-10min', 600);

    await loginAs(page, session);

    await expect(homeTile(page, 'Série en cours')).toContainText('2');
    await expect(page.getByRole('main')).toContainText('jour 2 de ta série');
  });

  test('should display total workout time', async ({ page, request }) => {
    await createCompletedSession(request, session, 'douce-10min', 30 * 60);
    await createCompletedSession(request, session, 'bureau-5min', 30 * 60);

    await loginAs(page, session, '/settings');

    const tile = page.locator('.settings-stat').filter({ hasText: 'Temps cumulé' });
    await expect(tile).toContainText('1h');
    await expect(
      page.locator('.settings-stat').filter({ hasText: 'Séances' }),
    ).toContainText('2');
  });

  test('should show calendar days with activity', async ({ page, request }) => {
    await createCompletedSession(request, session, 'douce-10min', 600);

    await loginAs(page, session, '/calendar');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^1 séances?\.$/);

    const year = new Date().getFullYear();
    // A day of the current year without any session (Jan 2nd if today is Jan 1st)
    const emptyDate =
      localDate() === `${year}-01-01` ? `${year}-01-02` : `${year}-01-01`;
    const color = (date: string) =>
      page
        .locator(`.heat-cell[title="${date}"]`)
        .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(await color(localDate())).not.toBe(await color(emptyDate));
  });

  test('should display favorite routine', async ({ page }) => {
    await loginAs(page, session);

    await routineCard(page, 'Pause bureau')
      .getByRole('button', { name: 'Ajouter aux favoris' })
      .click();
    await expect(
      routineCard(page, 'Pause bureau').getByRole('button', {
        name: 'Retirer des favoris',
      }),
    ).toBeVisible();

    // Once the user has favorites, "Tes routines" on the home page lists only them
    await page.reload();
    await expect(
      routineCard(page, 'Pause bureau').getByRole('button', {
        name: 'Retirer des favoris',
      }),
    ).toBeVisible();
    await expect(routineCard(page, 'Routine douce')).toHaveCount(0);
  });
});

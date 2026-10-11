import { test, expect, APIRequestContext } from '@playwright/test';
import {
  API_URL,
  AuthSession,
  completeRoutine,
  loginAs,
  navLink,
  registerViaApi,
  routineCard,
  pageTitle,
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
    await expect(pageTitle(page, 'Tes 30 derniers jours.')).toBeVisible();
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
    await expect(pageTitle(page, '0 séances.')).toBeVisible();
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
    await expect(pageTitle(page, /^1 séances?\.$/)).toBeVisible();

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
    await expect(pageTitle(page, /^1 séances?\.$/)).toBeVisible();

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

  test('Issue #148: a new account shows no made-up activity in the settings', async ({
    page,
  }) => {
    await loginAs(page, session, '/settings');
    await expect(pageTitle(page, 'Tes 30 derniers jours.')).toBeVisible();
    const main = page.getByRole('main').first();

    // These figures used to be hard-coded for every user
    await expect(main).not.toContainText('Squash quotidien');
    await expect(main).not.toContainText('Bureau express');
    await expect(main).not.toContainText('moy. 4 séances');

    await expect(page.locator('.settings-bar-count')).toHaveText([
      '0',
      '0',
      '0',
      '0',
      '0',
      '0',
      '0',
    ]);
    await expect(page.locator('.settings-routine-row')).toHaveCount(0);
    await expect(page.locator('.settings-empty')).toHaveText([
      /Pas encore de séance sur les 30 derniers jours/,
      /Pas encore de séance/,
    ]);
  });

  test('Issue #148: weekday activity and top routines come from the real sessions', async ({
    page,
    request,
  }) => {
    // Noon local time on the Monday and the Wednesday of last week: always in
    // the past, always within the last 30 days
    const lastWeek = (weekday: number) => {
      const date = new Date();
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7) - 7 + weekday);
      date.setHours(12, 0, 0, 0);
      return date;
    };
    await createCompletedSession(request, session, 'bureau-5min', 300, lastWeek(0));
    await createCompletedSession(request, session, 'bureau-5min', 300, lastWeek(0));
    await createCompletedSession(request, session, 'douce-10min', 600, lastWeek(2));
    // Too old to count in the "last 30 days" blocks
    await createCompletedSession(
      request,
      session,
      'douce-10min',
      600,
      new Date(Date.now() - 45 * 24 * 3600 * 1000),
    );

    await loginAs(page, session, '/settings');

    // Lun … Dim
    await expect(page.locator('.settings-bar-count')).toHaveText([
      '2',
      '0',
      '1',
      '0',
      '0',
      '0',
      '0',
    ]);
    await expect(page.locator('.settings-avg')).toHaveText(
      '30 derniers jours · 3 séances',
    );
    await expect(page.locator('.settings-bar-fill--hi')).toHaveCount(1);

    await expect(page.locator('.settings-routine-name')).toHaveText([
      'Pause bureau',
      'Routine douce',
    ]);
    await expect(page.locator('.settings-routine-count')).toHaveText([
      '2×',
      '1×',
    ]);
    await expect(page.locator('.settings-empty')).toHaveCount(0);
  });

  test('Issue #148: a routine appears in the top after being played', async ({
    page,
  }) => {
    await loginAs(page, session);
    await completeRoutine(page, 'bureau-5min');

    await page.goto('/settings');

    await expect(page.locator('.settings-routine-name')).toHaveText([
      'Pause bureau',
    ]);
    await expect(page.locator('.settings-routine-count')).toHaveText(['1×']);
    await expect(page.locator('.settings-avg')).toHaveText(
      '30 derniers jours · 1 séance',
    );
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

import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';
import {
  API_URL,
  AuthSession,
  completeRoutine,
  loginAs,
  registerViaApi,
  routineCard,
} from './support/helpers';

/**
 * Adds a step in the routine editor: "Ajouter" creates an empty step and opens
 * it in the detail panel, the only place where a step is edited (issue #146).
 */
async function addStep(
  page: Page,
  step: { name: string; seconds: number; text: string; cues?: string[] },
) {
  const count = await page.locator('.editor-step').count();
  await page.locator('.editor-add-btn').click();
  await expect(page.locator('.editor-step')).toHaveCount(count + 1);
  const panel = page.locator('.editor-panel-card');
  await expect(panel).toBeVisible();

  await page.locator('#step-name').fill(step.name);
  await page.locator('#step-seconds').fill(String(step.seconds));
  await page.locator('#step-text').fill(step.text);
  for (const [i, say] of (step.cues ?? []).entries()) {
    await panel.locator('.editor-cues-add-btn').click();
    await panel.locator('.editor-cue-at').nth(i).fill(String((i + 1) * 2));
    await panel.locator('.editor-cue-say').nth(i).fill(say);
  }

  await expect(page.locator('.editor-step').nth(count)).toContainText(
    step.name,
  );
}

test.describe('Routines Flow', () => {
  let session: AuthSession;

  test.beforeEach(async ({ page, request }) => {
    session = await registerViaApi(request, 'routines');
    await loginAs(page, session, '/routines');
    await expect(page.getByRole('heading', { name: 'Routines.' })).toBeVisible();
  });

  test('should display routines list', async ({ page }) => {
    await expect(routineCard(page, 'Routine douce')).toBeVisible();
    await expect(routineCard(page, 'Pause bureau')).toBeVisible();
    await expect(routineCard(page, 'Routine douce')).toContainText('10 min');
    await expect(routineCard(page, 'Routine douce')).toContainText('10 étapes');
  });

  test('should filter routines by tag', async ({ page }) => {
    await page.getByRole('button', { name: 'Bureau', exact: true }).click();
    await expect(routineCard(page, 'Pause bureau')).toBeVisible();
    await expect(routineCard(page, 'Routine douce')).toHaveCount(0);

    await page.getByRole('button', { name: 'Quotidien', exact: true }).click();
    await expect(routineCard(page, 'Routine douce')).toBeVisible();
    await expect(routineCard(page, 'Pause bureau')).toHaveCount(0);

    await page.getByRole('button', { name: 'Tout', exact: true }).click();
    await expect(routineCard(page, 'Routine douce')).toBeVisible();
    await expect(routineCard(page, 'Pause bureau')).toBeVisible();
  });

  test('should add a routine to favorites and filter on them', async ({
    page,
  }) => {
    await routineCard(page, 'Routine douce')
      .getByRole('button', { name: 'Ajouter aux favoris' })
      .click();
    await expect(
      routineCard(page, 'Routine douce').getByRole('button', {
        name: 'Retirer des favoris',
      }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Favoris', exact: true }).click();
    await expect(routineCard(page, 'Routine douce')).toBeVisible();
    await expect(routineCard(page, 'Pause bureau')).toHaveCount(0);

    // The favorite is stored server side
    await page.reload();
    await expect(
      routineCard(page, 'Routine douce').getByRole('button', {
        name: 'Retirer des favoris',
      }),
    ).toBeVisible();
  });

  test('should navigate to routine detail', async ({ page }) => {
    await routineCard(page, 'Routine douce')
      .getByRole('heading', { name: 'Routine douce' })
      .click();

    await expect(page).toHaveURL('/routine/douce-10min');
    await expect(page.getByText('Routine en cours')).toBeVisible();
  });

  test('should start a routine session', async ({ page }) => {
    await routineCard(page, 'Pause bureau')
      .getByRole('button', { name: 'Démarrer' })
      .click();
    await expect(page).toHaveURL('/routine/bureau-5min');

    await page.getByRole('button', { name: 'Démarrer' }).click();

    // Playing: the button turns into "Pause" and the step timer moves
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await expect(page.getByText('0:29')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByRole('button', { name: /Reprendre|Démarrer/ })).toBeVisible();
  });

  test('should display routine information', async ({ page }) => {
    await page.goto('/routine/douce-10min');

    const main = page.getByRole('main');
    await expect(main).toContainText('Routine douce');
    await expect(main).toContainText('Étape 1 / 10');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Respiration profonde' }),
    ).toBeVisible();
    await expect(main).toContainText('Épaules relâchées');
    await expect(main).toContainText('À suivre');
    await expect(main).toContainText('Rotations du bassin');
  });

  test('should navigate between exercises in player', async ({ page }) => {
    await page.goto('/routine/douce-10min');
    const main = page.getByRole('main');
    await expect(main).toContainText('Étape 1 / 10');

    await page.getByRole('button', { name: 'Étape suivante' }).click();
    await expect(main).toContainText('Étape 2 / 10');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Rotations du bassin' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Étape précédente' }).click();
    await expect(main).toContainText('Étape 1 / 10');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Respiration profonde' }),
    ).toBeVisible();
  });

  test('should complete a routine session', async ({ page, request }) => {
    await completeRoutine(page, 'bureau-5min');
    await expect(page.getByRole('main')).toContainText('Pause bureau');

    await page.getByRole('button', { name: /Bien$/ }).click();
    await page.getByRole('button', { name: 'Retour aux routines' }).click();
    // "Retour aux routines" leads to the catalogue, not to the home page (issue #150)
    await expect(page).toHaveURL('/routines');
    await expect(routineCard(page, 'Pause bureau')).toBeVisible();

    // The completed session and its feeling are saved
    await expect
      .poll(async () => {
        const res = await request.get(`${API_URL}/api/sessions`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const sessions = await res.json();
        return sessions.map((s: any) => [s.routineId, s.completed, s.feeling]);
      })
      .toEqual([['bureau-5min', true, 4]]);
  });

  test('Issue #35: should hide admin-only buttons for non-admin users', async ({
    page,
  }) => {
    await expect(page.getByRole('link', { name: 'Nouvelle routine' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Éditer' })).toHaveCount(0);
  });
});

test.describe('Issue #33: step editor scroll with multiple cues', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAs(page, await registerViaApi(request, 'cues'), '/routines/new');
    await expect(page.locator('.editor-shell')).toBeVisible();
  });

  // The step modal is gone (issue #146): the same guarantee now applies to the
  // detail panel, which must stay scrollable down to its last control.
  test('should allow scrolling in the step panel with many cues', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 640 });
    await page.locator('.editor-add-btn').click();
    const panel = page.locator('.editor-panel-card');
    await expect(panel).toBeVisible();

    await page.locator('#step-name').fill('Étape avec repères');
    await page.locator('#step-seconds').fill('60');
    await page.locator('#step-text').fill('Instructions');
    for (let i = 0; i < 8; i++) {
      await panel.locator('.editor-cues-add-btn').click();
      await panel.locator('.editor-cue-at').nth(i).fill(String(i * 5));
      await panel.locator('.editor-cue-say').nth(i).fill(`Repère ${i}`);
    }

    expect(
      await panel.evaluate((el) => el.scrollHeight > el.clientHeight),
    ).toBe(true);

    await panel.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    const deleteButton = panel.getByRole('button', {
      name: 'Supprimer cette étape',
    });
    await expect(deleteButton).toBeInViewport();
    await expect(panel.locator('.editor-cue-say').nth(7)).toHaveValue(
      'Repère 7',
    );
    await expect(page.getByRole('main')).toContainText('Étape avec repères');
  });
});

test.describe('Issue #146: a single way to edit a step', () => {
  let session: AuthSession;

  test.beforeEach(async ({ page, request }) => {
    session = await registerViaApi(request, 'step-edit');
    await loginAs(page, session, '/routines/new');
    await expect(page.locator('.editor-shell')).toBeVisible();
  });

  test('should create, edit and save a step from the panel only', async ({
    page,
    request,
  }) => {
    await page
      .getByRole('textbox', { name: 'Nom de la routine' })
      .fill('Routine panneau');
    const save = page.getByRole('button', { name: 'Enregistrer' });

    // A new step is incomplete until its name and instruction are filled in
    await page.locator('.editor-add-btn').click();
    const card = page.locator('.editor-step').first();
    await expect(card).toContainText('À compléter');
    await expect(save).toBeDisabled();
    // No modal and no "…" button: the card itself opens the panel
    await expect(page.locator('.modal-overlay')).toHaveCount(0);
    await expect(card.getByRole('button')).toHaveCount(0);

    await page.locator('#step-name').fill('Gainage');
    await page.locator('#step-text').fill('Corps aligné');
    await expect(card).not.toContainText('À compléter');
    await expect(save).toBeEnabled();

    // A voice cue beyond the duration of the step blocks the save
    const panel = page.locator('.editor-panel-card');
    await panel.locator('.editor-cues-add-btn').click();
    await panel.locator('.editor-cue-say').fill('Tiens bon');
    await panel.locator('.editor-cue-at').fill('45');
    await expect(panel).toContainText('entre 0 et la durée');
    await expect(save).toBeDisabled();
    await panel.locator('.editor-cue-at').fill('20');
    await expect(save).toBeEnabled();

    // Closing then reopening the panel by clicking the card keeps the data
    await card.click();
    await expect(page.locator('#step-name')).toHaveCount(0);
    await card.click();
    await expect(page.locator('#step-name')).toHaveValue('Gainage');
    await page.locator('#step-name').fill('Gainage ventral');
    await expect(card).toContainText('Gainage ventral');

    await save.click();
    await expect(page.locator('.editor-alert--success')).toHaveText(
      'Routine créée avec succès',
    );
    await expect(page).toHaveURL('/routines');

    let steps: any[] = [];
    await expect
      .poll(async () => {
        const res = await request.get(`${API_URL}/api/routines`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const own = (await res.json()).filter(
          (r: any) => r.ownerId === session.user._id,
        );
        steps = own[0]?.steps ?? [];
        return own.map((r: any) => r.name);
      })
      .toEqual(['Routine panneau']);
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      name: 'Gainage ventral',
      seconds: 30,
      text: 'Corps aligné',
    });
    expect(steps[0].cues.map((c: any) => [c.at, c.say])).toEqual([
      [20, 'Tiens bon'],
    ]);
  });

  test('should edit a step on a phone, where the panel is a full-screen sheet', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page
      .getByRole('textbox', { name: 'Nom de la routine' })
      .fill('Routine mobile');

    await page.locator('.editor-add-btn').click();
    const panel = page.locator('.editor-panel-card');
    await expect(panel).toBeVisible();
    await page.locator('#step-name').fill('Étirement');
    await page.locator('#step-text').fill('Doucement');

    // "Terminé" closes the sheet and gives the list back
    await panel.getByRole('button', { name: 'Terminé' }).click();
    await expect(panel).toBeHidden();
    const card = page.locator('.editor-step').first();
    await expect(card).toContainText('Étirement');

    // Tapping the card is the way back to the editor
    await card.click();
    await expect(page.locator('#step-name')).toHaveValue('Étirement');
    await expect(page.locator('#step-name')).toBeInViewport();
  });
});

test.describe('Issue #34: Import/Export with MongoDB _id fields', () => {
  let session: AuthSession;

  test.beforeEach(async ({ page, request }) => {
    session = await registerViaApi(request, 'import-export');
    await loginAs(page, session, '/routines/new');
    await expect(page.locator('.editor-shell')).toBeVisible();
  });

  test('should export and re-import routine without _id errors', async ({
    page,
    request,
  }) => {
    await page.getByRole('textbox', { name: 'Nom de la routine' }).fill(
      'Routine exportée',
    );
    await addStep(page, {
      name: 'Étape exportée',
      seconds: 30,
      text: 'Instructions',
      cues: ['Mi-parcours', 'Presque fini'],
    });

    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exporter' }).click();
    const download = await downloadPromise;
    const exported = JSON.parse(readFileSync((await download.path())!, 'utf-8'));
    expect(exported.version).toBe('1.0');
    expect(exported.routine.name).toBe('Routine exportée');
    expect(download.suggestedFilename()).toMatch(/\.json$/);

    // Re-import into a fresh editor and save
    await page.goto('/routines/new');
    await expect(page.locator('.editor-shell')).toBeVisible();
    // Re-use the exported content under its suggested file name (*.json)
    await page
      .locator('input[type="file"][accept=".json,.routine.json"]')
      .setInputFiles({
        name: download.suggestedFilename(),
        mimeType: 'application/json',
        buffer: readFileSync((await download.path())!),
      });
    await expect(
      page.getByRole('textbox', { name: 'Nom de la routine' }),
    ).toHaveValue('Routine exportée');

    // The import already shows a success alert ("Routine importée…"): wait for
    // the save's own confirmation, then for the redirect to the list.
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.locator('.editor-alert--success')).toHaveText(
      'Routine créée avec succès',
    );
    await expect(page.locator('.editor-alert--error')).toHaveCount(0);
    await expect(page).toHaveURL('/routines');

    // The imported routine (and its cues) is stored for this user.
    // Polled: a replicated MongoDB may not expose the write to the next read
    // immediately. On failure the message lists what the API returned.
    let ownRoutines: any[] = [];
    await expect
      .poll(
        async () => {
          const res = await request.get(`${API_URL}/api/routines`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          expect(res.status()).toBe(200);
          ownRoutines = (await res.json()).filter(
            (r: any) => r.ownerId === session.user._id,
          );
          return ownRoutines.map((r: any) => r.name);
        },
        {
          message: `routines of ${session.user.email} returned by ${API_URL}`,
          timeout: 10_000,
        },
      )
      .toEqual(['Routine exportée']);
    expect(ownRoutines[0].steps[0].cues.map((c: any) => c.say)).toEqual([
      'Mi-parcours',
      'Presque fini',
    ]);
  });
});

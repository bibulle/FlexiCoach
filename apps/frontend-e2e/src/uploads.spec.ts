import { test, expect, APIRequestContext } from '@playwright/test';
import {
  API_URL,
  AuthSession,
  loginAs,
  registerViaApi,
} from './support/helpers';

/** Smallest valid PNG (1×1 pixel). */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/** Routines of the given user, as stored by the backend. */
async function ownRoutines(request: APIRequestContext, session: AuthSession) {
  const res = await request.get(`${API_URL}/api/routines`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).filter((r: any) => r.ownerId === session.user._id);
}

test.describe('Issue #173: step images survive on the server', () => {
  let session: AuthSession;

  test.beforeEach(async ({ request }) => {
    session = await registerViaApi(request, 'uploads');
  });

  test('should upload a step image in the editor and show it in the player', async ({
    page,
    request,
  }) => {
    await loginAs(page, session, '/routines/new');
    await expect(page.locator('.editor-shell')).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Nom de la routine' })
      .fill('Routine illustrée');
    await page.locator('.editor-add-btn').click();
    await page.locator('#step-name').fill('Planche');
    await page.locator('#step-text').fill('Corps aligné');

    const panel = page.locator('.editor-panel-card');
    await panel
      .locator('input[type="file"][accept^="image/"]')
      .setInputFiles({ name: 'planche.png', mimeType: 'image/png', buffer: PNG });

    // The thumbnail is served by the backend and really loads
    const thumbnail = panel.locator('.editor-image-thumb img');
    await expect(thumbnail).toBeVisible();
    await expect(thumbnail).toHaveAttribute('src', /^\/uploads\/[0-9a-f-]+\.png$/);
    await expect
      .poll(() => thumbnail.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await expect(panel.locator('.editor-image-filename')).toHaveText(
      'planche.png',
    );
    await expect(page.locator('.step-image-indicator')).toBeVisible();

    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.locator('.editor-alert--success')).toHaveText(
      'Routine créée avec succès',
    );
    await expect(page).toHaveURL('/routines');

    // The image is stored by the backend: same bytes, readable without a session
    let routines: any[] = [];
    await expect
      .poll(async () => {
        routines = await ownRoutines(request, session);
        return routines.map((r: any) => r.name);
      })
      .toEqual(['Routine illustrée']);
    const imageUrl: string = routines[0].steps[0].imageUrl;
    const image = await request.get(`${API_URL}${imageUrl}`);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/png');
    expect((await image.body()).equals(PNG)).toBe(true);

    // And the player shows it
    await page.goto(`/routine/${routines[0].slug}`);
    const stepImage = page.locator('.player-step-image');
    await expect(stepImage).toBeVisible();
    await expect(stepImage).toHaveAttribute('src', imageUrl);
    await expect
      .poll(() => stepImage.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });

  test('should hide a step image that no longer exists on the server', async ({
    page,
    request,
  }) => {
    // A routine created before the fix: its image was lost with a redeployment
    const lostImage = '/uploads/00000000-0000-0000-0000-000000000000.png';
    const created = await request.post(`${API_URL}/api/routines`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      data: {
        name: 'Routine ancienne',
        difficulty: 'beginner',
        steps: [
          {
            name: 'Étape illustrée',
            seconds: 30,
            mode: 'statique',
            text: 'Tiens la position',
            imageUrl: lostImage,
            imageName: 'perdue.png',
          },
        ],
      },
    });
    expect(created.status(), await created.text()).toBe(201);
    const routine = await created.json();

    // Player: the step is playable, without a broken picture
    await loginAs(page, session, `/routine/${routine.slug}`);
    await expect(page.locator('.player-step-name')).toHaveText(
      'Étape illustrée',
    );
    await expect(page.locator('.player-step-figure')).toHaveCount(0);

    // Editor: the image is reported as missing, and can be replaced
    await page.goto(`/routines/${routine.id}/edit`);
    await page.locator('.editor-step').first().click();
    const panel = page.locator('.editor-panel-card');
    await expect(panel.locator('.editor-image-missing')).toHaveText(
      'Image introuvable',
    );
    await expect(panel.locator('.editor-image-thumb img')).toHaveCount(0);

    await panel
      .locator('input[type="file"][accept^="image/"]')
      .setInputFiles({ name: 'nouvelle.png', mimeType: 'image/png', buffer: PNG });
    await expect(panel.locator('.editor-image-thumb img')).toBeVisible();
    await expect(panel.locator('.editor-image-missing')).toHaveCount(0);
    await expect(panel.locator('.editor-image-filename')).toHaveText(
      'nouvelle.png',
    );
  });
});

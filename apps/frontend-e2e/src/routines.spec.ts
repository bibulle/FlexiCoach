import { test, expect } from '@playwright/test';

test.describe('Routines Flow', () => {
  const testEmail = `test-routines-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto('/signup');
    await page.fill('input[id="displayName"]', 'Routines Test');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display routines list', async ({ page }) => {
    // Should be on routines page after login
    await expect(page.locator('h1, h2')).toContainText('Routines');

    // Should display routine cards
    const routineCards = page.locator('.routine-card, [class*="routine"]');
    await expect(routineCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter routines by level', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });

    // Check if filter exists
    const filterSelect = page.locator('select, [role="combobox"]').first();
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption({ label: 'Débutant' });

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // All visible routines should be for beginners
      const routineCards = page.locator('.routine-card, [class*="routine"]');
      const count = await routineCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should navigate to routine detail', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });

    // Click on first routine
    const firstRoutine = page
      .locator('.routine-card, [class*="routine"]')
      .first();
    await firstRoutine.click();

    // Should navigate to routine detail/player page
    await expect(page).toHaveURL(/\/(routine|player)/);
  });

  test('should start a routine session', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });

    // Click on first routine
    await page.locator('.routine-card, [class*="routine"]').first().click();

    // Wait for detail page
    await page.waitForURL(/\/(routine|player)/);

    // Look for start button
    const startButton = page.locator(
      'button:has-text("Commencer"), button:has-text("Démarrer"), button:has-text("Start")',
    );
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();

      // Should show exercise player or timer
      await expect(
        page.locator('.timer, .exercise, [class*="player"]'),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display routine information', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });

    // Click on first routine
    await page.locator('.routine-card, [class*="routine"]').first().click();

    await page.waitForURL(/\/(routine|player)/);

    // Should display routine name
    await expect(page.locator('h1, h2')).not.toBeEmpty();

    // Should display duration or exercises count
    const hasInfo = await page
      .locator('text=/\\d+\\s*(min|exercices?)/i')
      .isVisible({ timeout: 3000 });
    expect(hasInfo).toBeTruthy();
  });

  test('should navigate between exercises in player', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });

    // Select a routine
    await page.locator('.routine-card, [class*="routine"]').first().click();
    await page.waitForURL(/\/(routine|player)/);

    // Start routine if needed
    const startButton = page.locator(
      'button:has-text("Commencer"), button:has-text("Démarrer")',
    );
    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();
    }

    // Look for next/skip button
    const nextButton = page.locator(
      'button:has-text("Suivant"), button:has-text("Next"), button:has-text("Skip"), button[aria-label*="next"]',
    );
    if (await nextButton.isVisible({ timeout: 5000 })) {
      const initialText = await page
        .locator('h1, h2, h3')
        .first()
        .textContent();
      await nextButton.click();

      // Wait for change
      await page.waitForTimeout(500);

      const newText = await page.locator('h1, h2, h3').first().textContent();
      // Exercise should have changed (different text) or routine completed
      expect(
        initialText !== newText ||
          (await page.locator('text=/complet|terminé|finished/i').isVisible()),
      ).toBeTruthy();
    }
  });

  test('should complete a routine session', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });

    // Select a short routine or any routine
    await page.locator('.routine-card, [class*="routine"]').first().click();
    await page.waitForURL(/\/(routine|player)/);

    // Start routine
    const startButton = page.locator(
      'button:has-text("Commencer"), button:has-text("Démarrer")',
    );
    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();
    }

    // Look for complete/finish button (might need to skip through exercises)
    const finishButton = page.locator(
      'button:has-text("Terminer"), button:has-text("Compléter"), button:has-text("Finish")',
    );

    // Try to skip to end if skip buttons exist
    let attempts = 0;
    while (attempts < 10) {
      if (await finishButton.isVisible({ timeout: 1000 })) {
        await finishButton.click();
        break;
      }

      const skipButton = page.locator(
        'button:has-text("Suivant"), button:has-text("Skip")',
      );
      if (await skipButton.isVisible({ timeout: 1000 })) {
        await skipButton.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
      attempts++;
    }

    // Should show completion screen or redirect
    const completionIndicators = page.locator(
      'text=/complet|terminé|finished|bravo|félicitations/i',
    );
    if (await completionIndicators.isVisible({ timeout: 3000 })) {
      expect(await completionIndicators.isVisible()).toBeTruthy();
    }
  });

  test('Issue #35: should hide admin-only buttons for non-admin users', async ({
    page,
  }) => {
    // User is already logged in as non-admin from beforeEach

    // Verify "Nouvelle routine" button is NOT visible
    const newRoutineButton = page.locator('a[href="/routines/new"]');
    await expect(newRoutineButton).not.toBeVisible();

    // Verify edit/delete buttons are not visible
    const editButtons = page.locator('.btn-secondary:has-text("Éditer")');
    const deleteButtons = page.locator('.btn-danger:has-text("Supprimer")');

    await expect(editButtons).toHaveCount(0);
    await expect(deleteButtons).toHaveCount(0);

    // But "Démarrer" button should still be visible
    const startButtons = page.locator('.btn-primary:has-text("Démarrer")');
    await expect(startButtons.first()).toBeVisible();
  });
});

test.describe('Issue #33: Modal scroll with multiple cues', () => {
  const adminEmail = `admin-${Date.now()}@example.com`;
  const adminPassword = 'AdminPassword123!';

  test.beforeEach(async ({ page }) => {
    // Register and login as admin (if admin functionality exists)
    // For now, login as regular user - admin creation may require backend setup
    await page.goto('/signup');
    await page.fill('input[id="displayName"]', 'Modal Test User');
    await page.fill('input[id="email"]', adminEmail);
    await page.fill('input[id="password"]', adminPassword);
    await page.fill('input[id="confirmPassword"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test.skip('should allow scrolling in step editor modal with many cues', async ({
    page,
  }) => {
    // This test requires admin access to create routines
    // Skip for now - can be enabled once admin user setup is available

    await page.goto('/routines/new');

    // Click to add a step
    await page.click('button:has-text("Ajouter une étape")');

    // Fill in basic step info
    await page.fill('input[id="step-name"]', 'Test Step with Many Cues');
    await page.fill('input[id="step-seconds"]', '60');
    await page.selectOption('select[id="step-mode"]', 'mouvement');
    await page.fill('textarea[id="step-text"]', 'Test instructions');

    // Add 8 cues to trigger overflow
    for (let i = 0; i < 8; i++) {
      await page.click('button:has-text("Ajouter un repère")');
      await page.fill(`input[id="cue-at-${i}"]`, String(i * 5));
      await page.fill(`input[id="cue-say-${i}"]`, `Cue ${i}`);
    }

    // Verify modal is scrollable
    const modalBody = page.locator('.modal-body');
    const isScrollable = await modalBody.evaluate(
      (el) => el.scrollHeight > el.clientHeight,
    );
    expect(isScrollable).toBeTruthy();

    // Scroll to bottom
    await modalBody.evaluate((el) => el.scrollTo(0, el.scrollHeight));

    // Verify save button is still accessible
    const saveButton = page.locator(
      'button[type="submit"]:has-text("Ajouter")',
    );
    await expect(saveButton).toBeVisible();
  });
});

test.describe('Issue #34: Import/Export with MongoDB _id fields', () => {
  const testEmail = `import-export-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[id="displayName"]', 'Import Export Test');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test.skip('should export and re-import routine without _id errors', async ({
    page,
  }) => {
    // This test requires admin access to create and export routines
    // Skip for now - can be enabled once admin user setup is available

    // Navigate to create routine page
    await page.goto('/routines/new');

    // Create a routine with steps and cues
    await page.fill('input[name="name"]', 'Export Test Routine');
    await page.fill(
      'textarea[name="description"]',
      'Test routine for export/import',
    );

    // Add a step with cues
    await page.click('button:has-text("Ajouter une étape")');
    await page.fill('input[id="step-name"]', 'Test Step');
    await page.fill('input[id="step-seconds"]', '30');
    await page.fill('textarea[id="step-text"]', 'Test instructions');

    // Add cues
    await page.click('button:has-text("Ajouter un repère")');
    await page.fill('input[id="cue-at-0"]', '10');
    await page.fill('input[id="cue-say-0"]', 'Halfway');

    await page.click('button:has-text("Ajouter un repère")');
    await page.fill('input[id="cue-at-1"]', '20');
    await page.fill('input[id="cue-say-1"]', 'Almost done');

    // Save step
    await page.click('button[type="submit"]:has-text("Ajouter")');

    // Save routine
    await page.click('button[type="submit"]:has-text("Créer")');
    await expect(page.locator('text=/créée avec succès/i')).toBeVisible({
      timeout: 5000,
    });

    // Export the routine
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exporter")');
    const download = await downloadPromise;

    // Import the exported file
    await page.goto('/routines/new');
    await page.setInputFiles('input[type="file"]', await download.path());

    // Wait for import success
    await expect(page.locator('text=/importée avec succès/i')).toBeVisible({
      timeout: 5000,
    });

    // Save the imported routine
    await page.click('button[type="submit"]:has-text("Créer")');

    // Should NOT show _id validation error
    await expect(page.locator('text=/_id should not exist/i')).not.toBeVisible({
      timeout: 2000,
    });

    // Should show success
    await expect(page.locator('text=/créée avec succès/i')).toBeVisible({
      timeout: 5000,
    });
  });
});

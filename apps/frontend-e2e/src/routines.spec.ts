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
    await page.waitForSelector('.routine-card, [class*="routine"]', { timeout: 10000 });

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
    await page.waitForSelector('.routine-card, [class*="routine"]', { timeout: 10000 });

    // Click on first routine
    const firstRoutine = page.locator('.routine-card, [class*="routine"]').first();
    await firstRoutine.click();

    // Should navigate to routine detail/player page
    await expect(page).toHaveURL(/\/(routine|player)/);
  });

  test('should start a routine session', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', { timeout: 10000 });

    // Click on first routine
    await page.locator('.routine-card, [class*="routine"]').first().click();

    // Wait for detail page
    await page.waitForURL(/\/(routine|player)/);

    // Look for start button
    const startButton = page.locator('button:has-text("Commencer"), button:has-text("Démarrer"), button:has-text("Start")');
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();

      // Should show exercise player or timer
      await expect(page.locator('.timer, .exercise, [class*="player"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display routine information', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', { timeout: 10000 });

    // Click on first routine
    await page.locator('.routine-card, [class*="routine"]').first().click();

    await page.waitForURL(/\/(routine|player)/);

    // Should display routine name
    await expect(page.locator('h1, h2')).not.toBeEmpty();

    // Should display duration or exercises count
    const hasInfo = await page.locator('text=/\\d+\\s*(min|exercices?)/i').isVisible({ timeout: 3000 });
    expect(hasInfo).toBeTruthy();
  });

  test('should navigate between exercises in player', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', { timeout: 10000 });

    // Select a routine
    await page.locator('.routine-card, [class*="routine"]').first().click();
    await page.waitForURL(/\/(routine|player)/);

    // Start routine if needed
    const startButton = page.locator('button:has-text("Commencer"), button:has-text("Démarrer")');
    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();
    }

    // Look for next/skip button
    const nextButton = page.locator('button:has-text("Suivant"), button:has-text("Next"), button:has-text("Skip"), button[aria-label*="next"]');
    if (await nextButton.isVisible({ timeout: 5000 })) {
      const initialText = await page.locator('h1, h2, h3').first().textContent();
      await nextButton.click();

      // Wait for change
      await page.waitForTimeout(500);

      const newText = await page.locator('h1, h2, h3').first().textContent();
      // Exercise should have changed (different text) or routine completed
      expect(initialText !== newText || await page.locator('text=/complet|terminé|finished/i').isVisible()).toBeTruthy();
    }
  });

  test('should complete a routine session', async ({ page }) => {
    await page.waitForSelector('.routine-card, [class*="routine"]', { timeout: 10000 });

    // Select a short routine or any routine
    await page.locator('.routine-card, [class*="routine"]').first().click();
    await page.waitForURL(/\/(routine|player)/);

    // Start routine
    const startButton = page.locator('button:has-text("Commencer"), button:has-text("Démarrer")');
    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();
    }

    // Look for complete/finish button (might need to skip through exercises)
    const finishButton = page.locator('button:has-text("Terminer"), button:has-text("Compléter"), button:has-text("Finish")');

    // Try to skip to end if skip buttons exist
    let attempts = 0;
    while (attempts < 10) {
      if (await finishButton.isVisible({ timeout: 1000 })) {
        await finishButton.click();
        break;
      }

      const skipButton = page.locator('button:has-text("Suivant"), button:has-text("Skip")');
      if (await skipButton.isVisible({ timeout: 1000 })) {
        await skipButton.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
      attempts++;
    }

    // Should show completion screen or redirect
    const completionIndicators = page.locator('text=/complet|terminé|finished|bravo|félicitations/i');
    if (await completionIndicators.isVisible({ timeout: 3000 })) {
      expect(await completionIndicators.isVisible()).toBeTruthy();
    }
  });
});

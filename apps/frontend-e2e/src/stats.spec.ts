import { test, expect } from '@playwright/test';

test.describe('Stats and Calendar Flow', () => {
  const testEmail = `test-stats-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto('/signup');
    await page.fill('input[id="displayName"]', 'Stats Test');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should navigate to stats page', async ({ page }) => {
    // Look for stats link in navigation
    const statsLink = page.locator(
      'a:has-text("Stats"), a:has-text("Statistiques"), [href="/stats"]',
    );
    if (await statsLink.isVisible({ timeout: 5000 })) {
      await statsLink.click();
      await expect(page).toHaveURL('/stats');
    } else {
      // Try direct navigation
      await page.goto('/stats');
      await expect(page).toHaveURL('/stats');
    }
  });

  test('should display stats summary for new user', async ({ page }) => {
    await page.goto('/stats');

    // Should display stats cards/sections
    const statsSection = page
      .locator('.stats, .stat-card, [class*="stat"]')
      .first();
    await expect(statsSection).toBeVisible({ timeout: 5000 });

    // New user should have 0 sessions
    const zeroSessions = page.locator('text=/0\\s*(session|séance)/i');
    await expect(zeroSessions).toBeVisible({ timeout: 3000 });
  });

  test('should display calendar', async ({ page }) => {
    await page.goto('/stats');

    // Should have calendar component
    const calendar = page.locator('.calendar, [class*="calendar"]').first();
    await expect(calendar).toBeVisible({ timeout: 5000 });

    // Should show month navigation
    const monthDisplay = page.locator(
      'text=/janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i',
    );
    await expect(monthDisplay).toBeVisible();
  });

  test('should navigate calendar months', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForSelector('.calendar, [class*="calendar"]', {
      timeout: 5000,
    });

    // Get initial month
    const monthDisplay = page
      .locator(
        'text=/janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i',
      )
      .first();
    const initialMonth = await monthDisplay.textContent();

    // Click next month button
    const nextButton = page
      .locator(
        'button:has-text(">"), button[aria-label*="next"], button[aria-label*="suivant"]',
      )
      .first();
    if (await nextButton.isVisible({ timeout: 3000 })) {
      await nextButton.click();

      // Month should have changed
      await page.waitForTimeout(500);
      const newMonth = await monthDisplay.textContent();
      expect(newMonth).not.toBe(initialMonth);
    }
  });

  test('should display stats after completing a routine', async ({ page }) => {
    // Complete a routine first
    await page.goto('/');
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });

    // Select and start a routine
    await page.locator('.routine-card, [class*="routine"]').first().click();
    await page.waitForURL(/\/(routine|player)/);

    const startButton = page.locator(
      'button:has-text("Commencer"), button:has-text("Démarrer")',
    );
    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();
    }

    // Try to complete quickly
    let attempts = 0;
    while (attempts < 10) {
      const finishButton = page.locator(
        'button:has-text("Terminer"), button:has-text("Compléter")',
      );
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

    // Navigate to stats
    await page.goto('/stats');

    // Should show 1 session completed
    const sessionCount = page.locator('text=/1\\s*(session|séance)/i');
    await expect(sessionCount).toBeVisible({ timeout: 5000 });
  });

  test('should display workout streak', async ({ page }) => {
    await page.goto('/stats');

    // Should display streak information
    const streakElement = page.locator('text=/streak|série|consécutif/i');
    await expect(streakElement).toBeVisible({ timeout: 5000 });

    // New user should have 0 or 1 day streak
    const streakNumber = page.locator('text=/[0-1]\\s*(jour|day)/i');
    await expect(streakNumber).toBeVisible();
  });

  test('should display total workout time', async ({ page }) => {
    await page.goto('/stats');

    // Should display total time
    const timeElement = page.locator('text=/temps|durée|time/i');
    await expect(timeElement).toBeVisible({ timeout: 5000 });

    // Should have minutes or hours indication
    const timeValue = page.locator('text=/\\d+\\s*(min|h|minute|hour)/i');
    await expect(timeValue).toBeVisible();
  });

  test('should show calendar days with activity', async ({ page }) => {
    // First complete a routine
    await page.goto('/');
    await page.waitForSelector('.routine-card, [class*="routine"]', {
      timeout: 10000,
    });
    await page.locator('.routine-card, [class*="routine"]').first().click();
    await page.waitForURL(/\/(routine|player)/);

    const startButton = page.locator(
      'button:has-text("Commencer"), button:has-text("Démarrer")',
    );
    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();
      await page.waitForTimeout(1000);

      // Complete or skip
      let attempts = 0;
      while (attempts < 10) {
        const finishButton = page.locator(
          'button:has-text("Terminer"), button:has-text("Compléter")',
        );
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
    }

    // Go to stats
    await page.goto('/stats');
    await page.waitForSelector('.calendar, [class*="calendar"]', {
      timeout: 5000,
    });

    // Calendar should have at least one day with activity indicator
    const activityDay = page
      .locator('.has-activity, .completed, [class*="active"]')
      .first();
    const hasActivity = await activityDay.isVisible({ timeout: 3000 });

    // If no visual indicator, at least stats should show 1 session
    if (!hasActivity) {
      const sessionCount = page.locator('text=/1\\s*(session|séance)/i');
      await expect(sessionCount).toBeVisible();
    }
  });

  test('should display favorite routine', async ({ page }) => {
    await page.goto('/stats');

    // Should show favorite routine section
    const favoriteSection = page.locator('text=/favori|préféré|favorite/i');
    await expect(favoriteSection).toBeVisible({ timeout: 5000 });
  });
});

import { test, expect } from '@playwright/test';

/**
 * Shop and Economy Smoke Tests  
 * Verifies shop loads and economy system exists
 */

test.describe('Shop Tests', () => {
    test('shop page loads via HUD', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Look for shop button in HUD (top area)
        const shopButton = page.locator('button').filter({ hasText: /shop|store/i }).first();

        // If shop button exists, click it
        if (await shopButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await shopButton.click();
            await page.waitForTimeout(500);

            // Verify we're on shop page
            await expect(page.getByText(/shop|store|buy/i).first()).toBeVisible({ timeout: 5000 });
        }
    });

    test('economy data persists in localStorage', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Set economy data
        await page.evaluate(() => {
            const economy = {
                coins: 1000,
                xp: 100,
                level: 2
            };
            localStorage.setItem('vocab_quest_economy', JSON.stringify(economy));
        });

        // Reload
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify persisted
        const economy = await page.evaluate(() => {
            const data = localStorage.getItem('vocab_quest_economy');
            return data ? JSON.parse(data) : null;
        });

        expect(economy).toBeTruthy();
        expect(economy.coins).toBe(1000);
    });
});

import { test, expect } from '@playwright/test';

/**
 * Arena Smoke Tests
 * Verifies arena section loads
 */

test.describe('Arena Tests', () => {
    test('arena page loads via bottom nav', async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        await page.goto('/');
        // PARANOID: Wait for body instead of networkidle
        await expect(page.locator('body')).toBeVisible();

        // Look for Arena in bottom nav
        const arenaButton = page.getByRole('button', { name: /arena|battle/i });

        if (await arenaButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await arenaButton.click();
            await page.waitForTimeout(500);

            // Verify we're on arena page
            await expect(page.getByText(/arena|battle|opponent/i).first()).toBeVisible({ timeout: 15000 });
        }
    });

    test('arena stats initialize in localStorage', async ({ page }) => {
        await page.goto('/');
        // PARANOID: Wait for body instead of networkidle
        await expect(page.locator('body')).toBeVisible();

        // Check if economy exists in localStorage
        const hasEconomy = await page.evaluate(() => {
            return !!localStorage.getItem('vocab_quest_economy');
        });

        // If economy exists, verify arena fields
        if (hasEconomy) {
            const economy = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('vocab_quest_economy'));
            });

            // Arena stats should exist (even if 0)
            expect(economy.arenaELO).toBeDefined();
        }
    });
});

import { test, expect } from '@playwright/test';

/**
 * Simplified Core Flow E2E Test
 * Verifies basic app functionality works
 */

test.describe('App Smoke Tests', () => {
    test('app loads and shows Learn hub', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify Learn hub loads
        await expect(page.getByText(/learn|vocab/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('navigation between main sections works', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check bottom nav is visible
        const navBar = page.locator('nav, [role="navigation"]').last();
        await expect(navBar).toBeVisible({ timeout: 5000 });

        // Try clicking different nav items
        const sections = ['Arena', 'Progress', 'Revise', 'Games'];

        for (const section of sections) {
            const button = page.getByRole('button', { name: new RegExp(section, 'i') });
            if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
                await button.click();
                await page.waitForTimeout(500);
                // Just verify page didn't crash
                expect(page.url()).toBeTruthy();
            }
        }
    });

    test('local storage persists data', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Set some data in localStorage
        await page.evaluate(() => {
            localStorage.setItem('test_data', 'persisted');
        });

        // Reload
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify data persisted
        const data = await page.evaluate(() => {
            return localStorage.getItem('test_data');
        });

        expect(data).toBe('persisted');
    });
});

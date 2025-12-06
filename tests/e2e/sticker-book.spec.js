import { test, expect } from '@playwright/test';

test.describe('Sticker Book Feature', () => {
    test.beforeEach(async ({ page }) => {
        // Seed daily login to prevent modal from blocking UI
        await page.addInitScript(() => {
            localStorage.setItem('vocab_daily_login', JSON.stringify({
                lastLogin: new Date().toISOString(),
                streak: 1
            }));
            // Seed a win to ensure "First Victory" is unlocked
            localStorage.setItem('vocab_achievements_stats', JSON.stringify({
                wins: 1,
                totalCoins: 100,
                wordsMastered: 5
            }));
            localStorage.setItem('vocab_achievements', JSON.stringify(['first_win']));
        });
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        await page.goto('http://localhost:5173');
        // Wait for hydration
        await expect(page.locator('body')).toBeVisible();

        // Verify Learn Hub loaded
        await expect(page.getByRole('heading', { name: /Vocab Hub/i })).toBeVisible();
    });

    test('should navigate to Sticker Book and view stickers', async ({ page }) => {
        try {
            // 1. Navigate to Progress tab in NavBar
            // explicit wait for nav to ensure hydration
            await expect(page.locator('nav')).toBeVisible({ timeout: 5000 });

            console.log('Searching for Progress button...');
            const progressBtn = page.getByRole('button', { name: /Progress/i });
            await expect(progressBtn).toBeVisible({ timeout: 5000 });
            await progressBtn.click();

            // 2. Verify Sticker Book Loaded
            await expect(page.getByRole('heading', { name: /Progress/i })).toBeVisible();

            // DEBUG: Check localStorage
            const storage = await page.evaluate(() => JSON.stringify(localStorage));
            console.log('DEBUG LOCALSTORAGE:', storage);

            // 2b. Navigate to Achievements Tab
            await page.getByRole('button', { name: /Achievements/i }).click();

            // Wait for grid to render
            await expect(page.locator('div').filter({ hasText: 'Sticker Book' }).first()).toBeVisible({ timeout: 5000 });

            // 3. Verify Stickers exist (locked or unlocked)
            // We expect at least one sticker (First Victory)
            await expect(page.getByText('First Victory')).toBeVisible();

            // 4. Click a sticker to see details
            await page.getByText('First Victory').click();
            await expect(page.getByText('Win your first quiz.')).toBeVisible();

            // 5. Close modal
            await page.getByRole('button', { name: 'Close' }).click();
            await expect(page.getByText('Win your first quiz.')).not.toBeVisible();

            // 6. Back Navigation via Learn tab
            const learnBtn = page.getByRole('button', { name: /Learn/i });
            await expect(learnBtn).toBeVisible();
            await learnBtn.click();
            await expect(page.getByRole('heading', { name: /Vocab Hub/i })).toBeVisible();
        } catch (e) {
            console.log('TEST FAILED. Dumping page content:');
            console.log(await page.content());
            throw e;
        }
    });
});

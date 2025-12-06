import { test, expect } from '@playwright/test';

test.describe('Certificate Feature', () => {
    test.beforeEach(async ({ page }) => {
        // Seed daily login to prevent modal
        await page.addInitScript(() => {
            localStorage.setItem('vocab_daily_login', JSON.stringify({
                lastLogin: new Date().toISOString(),
                streak: 1
            }));
        });
        await page.goto('http://localhost:5173');
        await expect(page.locator('body')).toBeVisible();

        // Verify Learn Hub loaded
        await expect(page.getByRole('heading', { name: /Learn Hub/i })).toBeVisible();
    });

    test('should navigate to Certificate and view stats', async ({ page }) => {
        // 1. Navigate to Progress tab in NavBar
        const progressBtn = page.getByRole('button', { name: /Progress/i });
        await expect(progressBtn).toBeVisible();
        await progressBtn.click();

        // 2. Wait for Sticker Book to load, then click Certificate Button
        await expect(page.getByRole('heading', { name: /Sticker Book/i })).toBeVisible();
        const certBtn = page.getByTitle('View Certificate');
        await expect(certBtn).toBeVisible();
        await certBtn.click();

        // 3. Verify Certificate Loaded
        await expect(page.getByRole('heading', { name: 'Certificate' })).toBeVisible();
        await expect(page.getByText('Vocab Master')).toBeVisible();
        // Note: "Total Coins" changed to "Total Stars" per learning-focused design
        await expect(page.getByText(/Total Stars|Total Coins/i)).toBeVisible();

        // 4. Verify Back Navigation (wait for visibility before clicking)
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();
        await expect(page.getByRole('heading', { name: /Sticker Book/i })).toBeVisible();
    });
});

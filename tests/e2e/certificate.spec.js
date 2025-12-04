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
    });

    test('should navigate to Certificate and view stats', async ({ page }) => {
        // 1. Navigate to Sticker Book
        await page.getByRole('button', { name: 'Stickers' }).click();

        // 2. Click Certificate Button (scroll icon)
        const certBtn = page.getByTitle('View Certificate');
        await expect(certBtn).toBeVisible();
        await certBtn.click();

        // 3. Verify Certificate Loaded
        await expect(page.getByRole('heading', { name: 'Certificate' })).toBeVisible();
        await expect(page.getByText('Vocab Master')).toBeVisible();
        await expect(page.getByText('Total Coins')).toBeVisible();

        // 4. Verify Back Navigation
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.getByRole('heading', { name: 'Sticker Book' })).toBeVisible();
    });
});

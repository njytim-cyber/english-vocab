import { test, expect } from '@playwright/test';

test.describe('Shop Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Suppress Daily Login
        await page.addInitScript(() => {
            localStorage.setItem('vocab_daily_login', JSON.stringify({
                lastLogin: new Date().toISOString(),
                streak: 1
            }));
        });
        await page.goto('http://localhost:5173');
        // Wait for hydration
        await expect(page.locator('body')).toBeVisible();

        // Verify Learn Hub loaded
        await expect(page.getByRole('heading', { name: /Learn Hub/i })).toBeVisible();
    });

    test('should navigate to Shop and filter items', async ({ page }) => {
        // 1. Navigate to Shop via NavBar "Rewards" tab
        const rewardsBtn = page.getByRole('button', { name: /Rewards/i });
        await expect(rewardsBtn).toBeVisible();
        await rewardsBtn.click();

        // 2. Verify Shop Loaded
        await expect(page.getByRole('heading', { name: 'Item Shop' })).toBeVisible();

        // 3. Verify Categories (Note: "All" was removed per user request)
        await expect(page.getByRole('button', { name: 'Accessories' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Avatars' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Themes' })).toBeVisible();

        // 4. Test Filtering - Default is "Accessories"
        await expect(page.getByText('Cool Shades')).toBeVisible();

        // Filter by Avatars
        await page.getByRole('button', { name: 'Avatars' }).click();
        await expect(page.getByText('Robot')).toBeVisible();
        await expect(page.getByText('Cool Shades')).not.toBeVisible(); // Should be hidden

        // Filter by Themes
        await page.getByRole('button', { name: 'Themes' }).click();
        // Note: Dark Mode was made free and removed from shop
        await expect(page.getByText('Robot')).not.toBeVisible();

        // 5. Back Navigation via Learn NavBar
        const learnBtn = page.getByRole('button', { name: /Learn/i });
        await expect(learnBtn).toBeVisible();
        await learnBtn.click();
        await expect(page.getByRole('heading', { name: /Learn Hub/i })).toBeVisible();
    });
});

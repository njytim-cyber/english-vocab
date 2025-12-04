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

        // Give some coins for testing (hacky but effective for now, or we rely on initial state)
        // Since we can't easily inject state, we might need to play a game first or assume 0 coins.
        // Actually, let's just test navigation and filtering for now. Buying requires coins.
        // We can use the browser console to inject coins if needed, but let's stick to UI flow first.
    });

    test('should navigate to Shop and filter items', async ({ page }) => {
        // 1. Navigate to Shop
        // Use the dashboard button or navbar button. Let's pick the dashboard one which is prominent.
        // We use exact text match including emoji to be safe, or first().
        await page.getByRole('button', { name: '🛒 Shop' }).first().click();

        // 2. Verify Shop Loaded
        await expect(page.getByRole('heading', { name: 'Item Shop' })).toBeVisible();

        // 3. Verify Categories
        await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Accessories' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Avatars' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Themes' })).toBeVisible();

        // 4. Test Filtering
        // Default 'All' should show everything
        await expect(page.getByText('Cool Shades')).toBeVisible();
        await expect(page.getByText('Robot')).toBeVisible();
        await expect(page.getByText('Dark Mode')).toBeVisible();

        // Filter by Avatars
        await page.getByRole('button', { name: 'Avatars' }).click();
        await expect(page.getByText('Robot')).toBeVisible();
        await expect(page.getByText('Cool Shades')).not.toBeVisible(); // Should be hidden

        // Filter by Themes
        await page.getByRole('button', { name: 'Themes' }).click();
        await expect(page.getByText('Dark Mode')).toBeVisible();
        await expect(page.getByText('Robot')).not.toBeVisible();

        // 5. Back Navigation
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.getByText('Home Base')).toBeVisible();
    });
});

import { test, expect } from '@playwright/test';

test.describe('Daily Login Feature', () => {
    test.beforeEach(async ({ page }) => {
        // Clear local storage to force daily login to appear
        await page.addInitScript(() => {
            localStorage.removeItem('vocab_daily_login');
        });
        await page.goto('http://localhost:5173');
    });

    test('should show daily login modal and allow claiming', async ({ page }) => {
        // 1. Verify Modal Appears
        await expect(page.getByText('Daily Rewards 📅')).toBeVisible();

        // 2. Claim Reward
        const claimBtn = page.getByRole('button', { name: 'Claim Reward!' });
        await expect(claimBtn).toBeVisible();
        await claimBtn.click();

        // 3. Verify Claimed State (Modal should close or show "Come Back Tomorrow")
        // Our logic closes it after 2s, but button changes immediately
        await expect(page.getByRole('button', { name: 'Come Back Tomorrow' })).toBeVisible();

        // Wait for modal to close
        await expect(page.getByText('Daily Rewards 📅')).not.toBeVisible({ timeout: 5000 });
    });
});

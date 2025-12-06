
import { test, expect } from '@playwright/test';

test.describe('Stats & Report Verification', () => {
    test.beforeEach(async ({ page }) => {
        // Clear storage to start fresh or seed with specific state
        await page.addInitScript(() => {
            localStorage.clear();
            // Seed daily login to avoid modal blocking
            localStorage.setItem('vocab_daily_login', JSON.stringify({
                lastLogin: new Date().toISOString(),
                streak: 1
            }));
        });
        await page.goto('http://localhost:5173');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should display valid number stats (not NaN) in Progress Hub', async ({ page }) => {
        // 1. Navigate to Progress Hub
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        const progressBtn = page.getByRole('button', { name: /Progress/i });
        await expect(progressBtn).toBeVisible();
        await progressBtn.click();

        // 2. Wait for Progress Hub Header
        await expect(page.getByRole('heading', { name: /Progress/i })).toBeVisible();

        // 3. Check Overview Tab (Default)
        // Verify key stats are numbers
        const starsCard = page.locator('div', { hasText: 'Stars' }).last();
        // Note: StatCard structure: Icon, Value, Label. 
        // We look for the value associated with "Stars"

        // Let's use more specific locators based on the component structure
        // We can look for the text "Stars" and then find the sibling or parent

        // Check for presence of any "NaN" text globally on the page
        const nanText = page.getByText('NaN');
        await expect(nanText).not.toBeVisible();

        // 4. Navigate to Statistics Tab
        const statsTab = page.getByRole('button', { name: /Statistics/i });
        await expect(statsTab).toBeVisible();
        await statsTab.click();

        // Wait for stats content
        await expect(page.getByText('Summary')).toBeVisible();

        // Check specific rows
        // "Stars Collected" row
        const starsRow = page.locator('div').filter({ hasText: /^Stars Collected$/ }).first();
        // The value is in the sibling span or parent div context. 
        // In StatRow: <span>Label</span><span>Value</span>
        // So we get the parent, then the second child.

        // Verify no NaN here either
        await expect(page.getByText('NaN')).not.toBeVisible();
        // Placeholder for playthrough verification
        // test('should increment stats after a quiz playthrough', async ({ page }) => { ... });
    });
});

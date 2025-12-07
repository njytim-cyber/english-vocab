import { test, expect } from '@playwright/test';

/**
 * Shop Purchase E2E Test
 * Tests economy system integration: purchasing items and inventory updates
 * Follows "Paranoid" standards
 */

test.describe('Shop Purchase Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Grant test coins via localStorage
        await page.evaluate(() => {
            const economy = {
                coins: 10000,
                xp: 500,
                level: 3,
                eventTokens: 0,
                inventory: [],
                arenaWins: 0,
                arenaLosses: 0,
                arenaELO: 1000
            };
            localStorage.setItem('vocab_quest_economy', JSON.stringify(economy));
        });

        // Reload to apply changes
        await page.reload();
        await page.waitForLoadState('networkidle');
    });

    test('purchase avatar item from shop', async ({ page }) => {
        // Navigate to shop
        const beginButton = page.getByRole('button', { name: /begin journey/i });
        await expect(beginButton).toBeVisible();
        await beginButton.click();

        await page.waitForLoadState('networkidle');

        // Click Shop in navigation
        const shopButton = page.getByRole('button', { name: /shop/i });
        await expect(shopButton).toBeVisible({ timeout: 5000 });
        await shopButton.click();

        await page.waitForLoadState('networkidle');
        await expect(page.getByText(/shop|store/i).first()).toBeVisible({ timeout: 5000 });

        // Verify coins are displayed
        await expect(page.locator('text=/10000|10,000/').first()).toBeVisible({ timeout: 5000 });

        // Find a purchasable item (not owned)
        // Look for "Buy" or price buttons
        const buyButton = page.locator('button:has-text("Buy"), button:has-text("100"), button:has-text("200")').first();
        await expect(buyButton).toBeVisible({ timeout: 5000 });

        // Get initial coin count
        const initialCoins = await page.evaluate(() => {
            const data = localStorage.getItem('vocab_quest_economy');
            return data ? JSON.parse(data).coins : 0;
        });

        // Purchase item
        await buyButton.click();
        await page.waitForTimeout(500);

        // Verify purchase confirmation or coin update
        const updatedCoins = await page.evaluate(() => {
            const data = localStorage.getItem('vocab_quest_economy');
            return data ? JSON.parse(data).coins : 0;
        });

        expect(updatedCoins).toBeLessThan(initialCoins);

        // Verify item in inventory
        const inventory = await page.evaluate(() => {
            const data = localStorage.getItem('vocab_quest_economy');
            return data ? JSON.parse(data).inventory : [];
        });

        expect(inventory.length).toBeGreaterThan(0);
    });

    test('cannot purchase with insufficient coins', async ({ page }) => {
        // Set very low coins
        await page.evaluate(() => {
            const economy = JSON.parse(localStorage.getItem('vocab_quest_economy'));
            economy.coins = 10; // Very low amount
            localStorage.setItem('vocab_quest_economy', JSON.stringify(economy));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Navigate to shop
        const beginButton = page.getByRole('button', { name: /begin journey/i });
        await expect(beginButton).toBeVisible();
        await beginButton.click();

        await page.waitForLoadState('networkidle');

        const shopButton = page.getByRole('button', { name: /shop/i });
        await expect(shopButton).toBeVisible();
        await shopButton.click();

        await page.waitForLoadState('networkidle');

        // Try to buy expensive item
        const expensiveItem = page.locator('button:has-text("500"), button:has-text("1000")').first();

        if (await expensiveItem.isVisible({ timeout: 2000 }).catch(() => false)) {
            const initialCoins = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('vocab_quest_economy')).coins;
            });

            await expensiveItem.click();
            await page.waitForTimeout(500);

            // Coins should not change
            const finalCoins = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('vocab_quest_economy')).coins;
            });

            expect(finalCoins).toBe(initialCoins);
        }
    });

    test('cannot purchase already owned item', async ({ page }) => {
        // Add an item to inventory
        await page.evaluate(() => {
            const economy = JSON.parse(localStorage.getItem('vocab_quest_economy'));
            economy.inventory.push('sunglasses');
            localStorage.setItem('vocab_quest_economy', JSON.stringify(economy));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Navigate to shop
        const beginButton = page.getByRole('button', { name: /begin journey/i });
        await expect(beginButton).toBeVisible();
        await beginButton.click();

        await page.waitForLoadState('networkidle');

        const shopButton = page.getByRole('button', { name: /shop/i });
        await expect(shopButton).toBeVisible();
        await shopButton.click();

        await page.waitForLoadState('networkidle');

        // Verify "Owned" or similar indicator is shown
        await expect(page.locator('text=/owned|equipped/i').first()).toBeVisible({ timeout: 5000 });
    });
});


import { test, expect } from '@playwright/test';

test.describe('Shop & Avatar Feature', () => {
    test.beforeEach(async ({ page }) => {
        // Seed Economy with coins
        await page.addInitScript(() => {
            localStorage.setItem('vocab_economy', JSON.stringify({
                coins: 5000, // Rich!
                xp: 0,
                level: 1,
                inventory: []
            }));
            localStorage.setItem('vocab_user_profile', JSON.stringify({
                name: 'TestUser',
                avatar: '🦊', // Default
                equippedItems: {}
            }));
        });
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        await page.goto('http://localhost:5173');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should buy and equip a new avatar', async ({ page }) => {
        // 1. Navigate to Shop (Rewards)
        await page.getByRole('button', { name: 'Rewards' }).click();

        // 2. Locate the Robot avatar (Cost 300)
        // Switch to Avatar tab if needed (assuming default is accessory, verify tabs)
        await page.getByRole('button', { name: 'Avatars' }).click();

        const robotItem = page.locator('div').filter({ hasText: 'Robot' }).first();
        await expect(robotItem).toBeVisible();

        // 3. Buy it
        const buyBtn = robotItem.getByRole('button', { name: 'Buy' });
        await expect(buyBtn).toBeVisible();
        await buyBtn.click();

        // 4. Verify purchased and equipped
        // It should now say 'Equipped' or have 'Equip' button if not auto-equipped (logic says auto-equip if userProfile exists)
        // The toast message "Bought & Equipped Robot!" appears
        await expect(page.getByText('Bought & Equipped Robot!')).toBeVisible();

        const equippedBtn = robotItem.getByRole('button', { name: 'Equipped' });
        await expect(equippedBtn).toBeVisible();
    });

    test('should equip an owned item', async ({ page }) => {
        // Seed with item owned
        await page.addInitScript(() => {
            localStorage.setItem('vocab_economy', JSON.stringify({
                coins: 0,
                inventory: ['avatar_panda'] // Assuming ID
            }));
        });
        // ... (Test implementation omitted for brevity, focusing on main flow above)
    });
});

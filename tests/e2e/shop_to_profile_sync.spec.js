import { test, expect } from '@playwright/test';

test.describe('Shop to Profile Synchronization', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`PAGE: ${msg.text()}`));
        await page.goto('http://localhost:5173');
        await expect(page.locator('body')).toBeVisible();

        // Reset state if needed (clearing localStorage is a good idea for isolation)
        await page.evaluate(() => {
            localStorage.clear();
            // Pre-seed economy with coins for testing
            localStorage.setItem('vocab_quest_economy', JSON.stringify({
                coins: 1000,
                xp: 0,
                level: 1,
                inventory: []
            }));
            localStorage.setItem('vocab_daily_login', JSON.stringify({
                lastLogin: new Date().toISOString(),
                streak: 1
            }));
        });
        await page.reload();
        await expect(page.locator('body')).toBeVisible();
    });

    test('buying an item in shop unlocks it in profile', async ({ page }) => {
        // 1. Navigate to Shop
        const shopBtn = page.getByRole('button', { name: /Open Rewards Shop/i }); // Using regex for flexibility
        await expect(shopBtn).toBeVisible();
        await shopBtn.click();

        // 2. Buy "Cool Shades"
        // Find the item card. We assume "Cool Shades" is visible.
        const buyButton = page.getByRole('button', { name: /Buy Cool Shades/i });
        await expect(buyButton).toBeVisible();
        await buyButton.click();

        // 3. Verify Purchase Feedback
        // Check for toast or button change
        const equippedButton = page.getByRole('button', { name: /Equipped: Cool Shades/i });
        await expect(equippedButton).toBeVisible(); // Should auto-equip or at least show owned state

        // 4. Return to Home
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Open Profile
        // The avatar button might not have a specific text name, relying on aria-label or location if we added it.
        // Based on AvatarHUD.jsx, the button has the avatar and name.
        const profileBtn = page.getByRole('button', { name: /Open Profile/i }); // Updated to match aria-label
        await expect(profileBtn).toBeVisible();
        await profileBtn.click();

        // 6. Navigate to Eyes Tab (Cool Shades are eyes)
        const eyesTab = page.getByRole('button', { name: /Eyes/i });
        await expect(eyesTab).toBeVisible();
        await eyesTab.click();

        // 7. Verify "Cool Shades" is Unlocked
        // Should have aria-label "Equip Cool Shades" (not "Locked: Cool Shades")
        const coolShadesBtn = page.getByRole('button', { name: /Equip Cool Shades/i });
        await expect(coolShadesBtn).toBeVisible();
        await expect(coolShadesBtn).toBeEnabled();
    });
});

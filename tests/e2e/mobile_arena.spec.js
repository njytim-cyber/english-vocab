
import { test, expect } from '@playwright/test';

test.use({
    viewport: { width: 390, height: 844 }, // iPhone 13
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
});

test('Mobile Arena Layout Verification', async ({ page }) => {
    // 1. Navigate to Home
    await page.goto('http://localhost:5173/');
    await expect(page.locator('body')).toBeVisible();

    // 2. Navigate to Arena
    // The "Arena" card is on the main LearnHub (default view)
    // Use unique description text to ensure we click the card
    const arenaCard = page.getByText('Compete against AI opponents');
    await expect(arenaCard).toBeVisible();
    await arenaCard.click();

    // 3. Select Difficulty (screenshot shows "Choose Your Opponent")
    await expect(page.getByText('Choose Your Opponent')).toBeVisible();
    await page.getByText('Casual Player').click(); // Select default/easy

    // 4. Verify Layout
    // Header check
    await expect(page.getByText('ARENA', { exact: false })).toBeVisible();

    // Check for "YOU" and "Opponent" visibility
    await expect(page.getByText('YOU')).toBeVisible();
    await expect(page.getByText('Casual Player')).toBeVisible();

    // 5. Check for Vertical Stacking (Mobile Layout)
    const youPanel = page.getByText('YOU').locator('xpath=./../..'); // Parent container of YOU
    const oppPanel = page.getByText('Casual Player').locator('xpath=./../..'); // Parent container of Opponent

    const youBox = await youPanel.boundingBox();
    const oppBox = await oppPanel.boundingBox();

    // Verify Vertical Stacking:
    // The difference in Y positions implies one is above the other.
    // If side-by-side, Y positions would be similar (e.g., diff < 20px).
    expect(Math.abs(youBox.y - oppBox.y)).toBeGreaterThan(50);

    // Verify Panels are Wide (responsive width)
    // On a 390px viewport, they should take up most of width (minus margins/padding).
    expect(youBox.width).toBeGreaterThan(300);
});

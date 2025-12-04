import { test, expect } from '@playwright/test';

test('complete quiz flow', async ({ page }) => {
    // 1. Start Screen
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('Vocab Quest!')).toBeVisible();

    // Select Avatar
    const avatarBtn = page.getByText('🦊');
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    // Start Game
    const startBtn = page.getByRole('button', { name: 'Start Adventure!' });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 2. Quiz View
    // Q1
    await expect(page.getByText('This child is so _____ that he could not stop fidgeting.')).toBeVisible();
    const opt1 = page.getByRole('button', { name: 'restless' });
    await expect(opt1).toBeVisible();
    await opt1.click();

    // Wait for transition (1.5s delay in code)
    await expect(page.getByText('What is the synonym of \'Happy\'?')).toBeVisible({ timeout: 10000 });

    // Q2
    const opt2 = page.getByRole('button', { name: 'Joyful' });
    await expect(opt2).toBeVisible();
    await opt2.click();

    // 3. Results View
    await expect(page.getByText('Awesome!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Score')).toBeVisible();
    await expect(page.getByText('20')).toBeVisible(); // 2 correct answers * 10 points

    // Play Again
    const restartBtn = page.getByRole('button', { name: 'Play Again' });
    await expect(restartBtn).toBeVisible();
    await restartBtn.click();

    // Should be back to quiz (engine reset)
    await expect(page.getByText('This child is so _____ that he could not stop fidgeting.')).toBeVisible();
});

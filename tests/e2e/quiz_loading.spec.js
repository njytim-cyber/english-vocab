import { test, expect } from '@playwright/test';

test('Quiz loads successfully', async ({ page }) => {
    // Suppress Daily Login
    await page.addInitScript(() => {
        localStorage.setItem('vocab_daily_login', JSON.stringify({
            lastLogin: new Date().toISOString(),
            streak: 1
        }));
    });

    // 1. Navigate to Vocab Hub
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Vocab Hub/i })).toBeVisible();

    // 2. Click "New Quiz" card to go to Quiz Setup
    const newQuizCard = page.getByRole('button', { name: /New Quiz/i });
    await expect(newQuizCard).toBeVisible();
    await newQuizCard.click();

    // 3. Should see Quiz Setup screen with "Start Quiz!" button
    const setupStartBtn = page.getByRole('button', { name: 'Start Quiz!' });
    await expect(setupStartBtn).toBeVisible();
    await setupStartBtn.click();

    // 4. Verify Quiz View loaded - check for quiz-specific elements
    await expect(page.getByText('⭐')).first().toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/^\d+\s\/\s\d+$/)).toBeVisible({ timeout: 5000 });

    // Also verify we can see an answer option button (options exist)
    const optionBtns = page.locator('.option-btn');
    const count = await optionBtns.count();
    expect(count).toBeGreaterThan(0);
});

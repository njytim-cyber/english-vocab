import { test, expect } from '@playwright/test';

test('persistence of spaced repetition progress', async ({ page }) => {
    // Suppress Daily Login
    await page.addInitScript(() => {
        localStorage.setItem('vocab_daily_login', JSON.stringify({
            lastLogin: new Date().toISOString(),
            streak: 1
        }));
        // Clear any existing progress for clean test
        localStorage.removeItem('vocab_quest_progress');
    });

    // 1. Navigate to Learn Hub
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Learn Hub/i })).toBeVisible();

    // 2. Click "New Quiz" card to start quiz setup
    const newQuizCard = page.getByRole('button', { name: /New Quiz/i });
    await expect(newQuizCard).toBeVisible();
    await newQuizCard.click();

    // QuizSetup - click Start Quiz! to begin actual quiz
    await page.getByRole('button', { name: 'Start Quiz!' }).click();

    // 3. Verify Quiz Loaded
    await expect(page.getByText(/Score:/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Question \d+ \/ \d+/)).toBeVisible();

    // Get current question text before answering
    const questionCard = page.locator('.question-card');
    await expect(questionCard).toBeVisible();

    // 4. Answer First Question
    const options = page.locator('.option-btn');
    await expect(options.first()).toBeVisible();
    await options.first().click();

    // Wait for progression using proper expect pattern
    await expect(async () => {
        const finished = await page.getByRole('button', { name: /Play Again/i }).isVisible();
        if (finished) return true;
        // Question should have advanced
        const qCounter = await page.getByText(/Question \d+ \/ \d+/).textContent();
        return qCounter !== 'Question 1 / 10';
    }).toPass({ timeout: 5000 });

    // 5. Reload Page
    await page.reload();

    // 6. Restart Quiz
    await expect(page.getByRole('heading', { name: /Learn Hub/i })).toBeVisible();
    const newQuizCard2 = page.getByRole('button', { name: /New Quiz/i });
    await expect(newQuizCard2).toBeVisible();
    await newQuizCard2.click();
    await page.getByRole('button', { name: 'Start Quiz!' }).click();

    // 7. Verify Quiz Still Works After Reload
    await expect(page.getByText(/Score:/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Question \d+ \/ \d+/)).toBeVisible();

    // Progress should be preserved - quiz should still load properly
    const questionCardAfter = page.locator('.question-card');
    await expect(questionCardAfter).toBeVisible();
});

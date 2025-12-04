import { test, expect } from '@playwright/test';

test('Quiz loads successfully', async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error')
            console.log(`PAGE ERROR: ${msg.text()}`);
    });
    page.on('pageerror', exception => {
        console.log(`UNCAUGHT EXCEPTION: "${exception}"`);
    });

    // 1. Navigate to home
    await page.goto('/');

    // Handle Daily Login if present
    // It might be "Claim Reward!" or "Come Back Tomorrow"
    const dailyLogin = page.locator('h2', { hasText: 'Daily Rewards' });
    if (await dailyLogin.isVisible()) {
        console.log('Daily Login Detected');
        const claimBtn = page.getByRole('button', { name: 'Claim Reward!' });
        if (await claimBtn.isVisible()) {
            await claimBtn.click();
        } else {
            const closeBtn = page.getByRole('button', { name: 'Come Back Tomorrow' });
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
            }
        }
        // Wait for it to disappear
        await expect(dailyLogin).not.toBeVisible();
    }

    // 2. Hydration wait
    await expect(page.locator('body')).toBeVisible();

    // 3. Click "Quiz" in NavBar
    // Note: The button has text "Quiz" and an icon.
    const quizNavBtn = page.getByRole('button', { name: 'Quiz' });
    await expect(quizNavBtn).toBeVisible();
    await quizNavBtn.click();

    // 4. Expect Start Screen "Start Quiz" button
    // This button is on the StartScreen
    const startScreenBtn = page.getByRole('button', { name: 'Start Quiz' });
    await expect(startScreenBtn).toBeVisible();
    await startScreenBtn.click();

    // 5. Expect Quiz Setup "Start Quiz!" button
    // This button is on the QuizSetup screen
    const setupStartBtn = page.getByRole('button', { name: 'Start Quiz!' });
    await expect(setupStartBtn).toBeVisible();
    console.log('Attempting to click Start Quiz! button...');
    await setupStartBtn.click({ force: true });
    console.log('Clicked Start Quiz! button');

    // 6. Expect Quiz View elements
    // We expect to see "Lives" and "Score" which are standard in the quiz header
    // Verify click happened
    await expect(page.getByText('CLICKED START')).toBeVisible({ timeout: 5000 });

    try {
        await expect(page.getByText('HELLO QUIZ')).toBeVisible({ timeout: 5000 });
    } catch (e) {
        // Check for ErrorBoundary
        const errorBoundary = page.getByText('Something went wrong.');
        if (await errorBoundary.isVisible()) {
            const details = await page.locator('details').textContent();
            console.log('APP CRASH DETECTED:', details);
            throw new Error(`App crashed: ${details}`);
        }

        // Check for error message
        const errorMsg = page.getByText('Error: No Questions Available');
        if (await errorMsg.isVisible()) {
            const state = await page.locator('p').nth(0).textContent();
            const count = await page.locator('p').nth(1).textContent();
            console.log('DEBUG INFO:', state, count);
            throw new Error(`Quiz failed to load: ${state} ${count}`);
        }
        throw e;
    }
});

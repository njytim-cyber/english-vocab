import { test, expect } from '@playwright/test';

test('complete quiz flow', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    console.log('Starting Quiz test');

    // Suppress Daily Login
    await page.addInitScript(() => {
        localStorage.setItem('vocab_daily_login', JSON.stringify({
            lastLogin: new Date().toISOString(),
            streak: 1
        }));
    });

    // 1. Navigate to Learn Hub (new landing page)
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check for crash
    if (await page.getByText('Something went wrong.').isVisible()) {
        const errorDetails = await page.locator('details').innerText();
        console.error('APP CRASHED:', errorDetails);
        throw new Error('App crashed at startup');
    }

    // Verify Vocab Hub loaded
    await expect(page.getByRole('heading', { name: /Vocab Hub/i })).toBeVisible();
    console.log('Vocab Hub loaded');

    // 2. Click "New Quiz" card to go to QuizSetup
    const newQuizCard = page.getByRole('button', { name: /New Quiz/i });
    await expect(newQuizCard).toBeVisible();
    await newQuizCard.click();
    console.log('Clicked New Quiz card');

    // 3. QuizSetup - click Start Quiz! button to begin the actual quiz
    const setupStartBtn = page.getByRole('button', { name: /Start Quiz!/i });
    await expect(setupStartBtn).toBeVisible();
    await setupStartBtn.click();
    console.log('Clicked Setup Start Quiz');

    // 4. Quiz View - verify we're in quiz mode
    try {
        await expect(page.getByText('⭐')).first().toBeVisible({ timeout: 10000 });
    } catch (e) {
        console.log('FAILED TO FIND STARS. Taking screenshot...');
        await page.screenshot({ path: 'quiz_fail_debug.png' });
        throw e;
    }
    const qCounter = page.getByText(/^\d+\s\/\s\d+$/);
    await expect(qCounter).toBeVisible();
    console.log('Quiz View loaded');

    // Answer questions until results appear
    for (let i = 0; i < 15; i++) {
        // Check if results are visible (Play Again button) - fast check
        if (await page.getByRole('button', { name: /Play Again/i }).isVisible()) {
            console.log('Play Again visible, breaking loop');
            break;
        }

        // Get current question text to verify progression
        const currentText = await qCounter.innerText();
        console.log(`Question: ${currentText}`);

        // Find options
        const optionBtns = page.locator('.option-btn');
        await expect(optionBtns.first()).toBeVisible({ timeout: 5000 });

        // Click first option
        await optionBtns.first().click();
        console.log(`Attempt ${i}: Clicked option`);

        // Wait for progression: Either Question text changes OR Play Again appears
        await expect(async () => {
            const finished = await page.getByRole('button', { name: /Play Again/i }).isVisible();
            if (finished) return true;

            const newText = await qCounter.innerText();
            return newText !== currentText;
        }).toPass({ timeout: 5000 });
    }

    // 5. Results View - should eventually see results with Play Again
    await expect(page.getByRole('button', { name: /Play Again/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Score/i)).toBeVisible();
    console.log('Results View loaded');
});

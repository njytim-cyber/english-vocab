import { test, expect } from '@playwright/test';

test('persistence of spaced repetition progress', async ({ page }) => {
    // 1. Start Quiz
    await page.goto('/');
    await page.getByText('🦊').click();
    await page.getByRole('button', { name: 'Start Adventure!' }).click();

    // 2. Identify First Question (Q1)
    // Assuming Q1 is "This child is so..." and Q2 is "Synonym of Happy"
    // Both start at Box 1. Stable sort might keep order, or random. 
    // Our implementation preserves order if boxes are equal.

    const q1Text = 'This child is so _____ that he could not stop fidgeting.';
    const q2Text = 'What is the synonym of \'Happy\'?';

    await expect(page.getByText(q1Text)).toBeVisible();

    // 3. Answer Q1 Correctly -> Moves to Box 2
    await page.getByRole('button', { name: 'restless' }).click();

    // Wait for Q2 to appear
    await expect(page.getByText(q2Text)).toBeVisible({ timeout: 10000 });

    // 4. Reload Page
    await page.reload();

    // 5. Restart Quiz
    await page.getByText('🦊').click();
    await page.getByRole('button', { name: 'Start Adventure!' }).click();

    // 6. Verify Order Changed
    // Q1 (Box 2) should be after Q2 (Box 1)
    // So we should see Q2 first now.
    await expect(page.getByText(q2Text)).toBeVisible();
    await expect(page.getByText(q1Text)).not.toBeVisible();
});

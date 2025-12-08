
import { test, expect } from '@playwright/test';

test.describe('Paranoid E2E Verification', () => {

    test('Critical Flows - Listening & ReviseHub', async ({ page }) => {
        // 1. Initial Hydration Check
        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        // Assert Home Page Title or Header
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // 2. Navigation to Listening
        // Using "Learn" section if available, or finding the link.
        // Assuming there's a way to get to listening.
        // Looking for explicit text or role link.
        const listeningLink = page.getByText('Listening Comprehension');
        await expect(listeningLink).toBeVisible();
        await listeningLink.click();

        // 3. Listening Dashboard
        await expect(page.locator('body')).toBeVisible();
        // Wait for hydration
        await expect(page.getByText('Listening Comprehension')).first().toBeVisible();

        const startBtn = page.getByRole('button', { name: /Start/i }).first();
        await expect(startBtn).toBeVisible();
        await startBtn.click();

        // 5. Verify Player & Sticky Header
        await expect(page.getByText('Speed:')).toBeVisible();
        // Check for scrollable questions
        await expect(page.getByText('Question 1 of')).toBeVisible();

        // 6. Navigation Back
        await page.goBack();
        await expect(page.getByText('Listening Comprehension')).toBeVisible();
        await page.goBack();

        // 7. ReviseHub Navigation
        // Assuming "Revise" card or link on home
        const reviseLink = page.getByText('Revise');
        await expect(reviseLink).toBeVisible();
        await reviseLink.click();

        // 8. ReviseHub Tabs (Updated for new design)
        await expect(page.getByText('Continue')).toBeVisible(); // Tab
        await expect(page.getByText('Practice')).toBeVisible(); // Tab
        await expect(page.getByText('Flashcards')).toBeVisible(); // Tab

        const practiceTab = page.getByRole('button', { name: 'Practice' });
        await expect(practiceTab).toBeVisible();
        await practiceTab.click();

        // Verify practice mode launchers
        await expect(page.getByText('Vocab Quiz')).toBeVisible();
    });
});

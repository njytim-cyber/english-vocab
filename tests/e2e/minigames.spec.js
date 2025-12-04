import { test, expect } from '@playwright/test';

test.describe('Minigames Arcade Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Suppress Daily Login
        await page.addInitScript(() => {
            localStorage.setItem('vocab_daily_login', JSON.stringify({
                lastLogin: new Date().toISOString(),
                streak: 1
            }));
        });
        await page.goto('http://localhost:5173');
        // Wait for hydration
        await expect(page.locator('body')).toBeVisible();

        // Ensure we are on Home Base
        await expect(page.getByText('Home Base')).toBeVisible();
    });

    test('should navigate to Arcade and back', async ({ page }) => {
        // 1. Click Arcade button in NavBar
        const arcadeBtn = page.getByRole('button', { name: 'Arcade' });
        await expect(arcadeBtn).toBeVisible();
        await arcadeBtn.click();

        // 2. Verify Arcade Hub
        await expect(page.getByText('Arcade 🕹️')).toBeVisible();
        await expect(page.getByText('Word Search')).toBeVisible();

        // 3. Click Back
        const backBtn = page.getByRole('button', { name: 'Back to Home' });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 4. Verify Home Base
        await expect(page.getByText('Home Base')).toBeVisible();
    });

    test('should play Word Search game', async ({ page }) => {
        // 1. Navigate to Arcade
        const arcadeBtn = page.getByRole('button', { name: 'Arcade' });
        await expect(arcadeBtn).toBeVisible();
        await arcadeBtn.click();

        // 2. Select Word Search
        const wordSearchBtn = page.getByRole('button', { name: 'Word Search' });
        await expect(wordSearchBtn).toBeVisible();
        await wordSearchBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: 'Word Search' })).toBeVisible();

        // Check for grid cells (should be 100)
        const cells = page.locator('.word-search-game > div:nth-child(2) > div');
        await expect(cells).toHaveCount(100);

        // Check for word list
        const wordList = page.locator('.word-search-game > div:nth-child(3) > div');
        // We expect some words to be placed (might be fewer than 8 if placement fails)
        const count = await wordList.count();
        expect(count).toBeGreaterThan(0);

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: 'Back' });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Arcade 🕹️')).toBeVisible();
    });

    test('should play Definition Match game', async ({ page }) => {
        // 1. Navigate to Arcade
        const arcadeBtn = page.getByRole('button', { name: 'Arcade' });
        await expect(arcadeBtn).toBeVisible();
        await arcadeBtn.click();

        // 2. Select Definition Match
        const gameBtn = page.getByRole('button', { name: 'Definition Match' });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: 'Definition Match' })).toBeVisible();

        // Check for word cards (should be 5 words + 5 definitions = 10 cards)
        // Note: We use a flexible selector because the exact class structure might vary
        const cards = page.locator('.definition-match-game button.card');
        await expect(cards).toHaveCount(10);

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: 'Back' });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Arcade 🕹️')).toBeVisible();
    });

    test('should play Letter Deduction game', async ({ page }) => {
        // 1. Navigate to Arcade
        const arcadeBtn = page.getByRole('button', { name: 'Arcade' });
        await expect(arcadeBtn).toBeVisible();
        await arcadeBtn.click();

        // 2. Select Letter Deduction
        const gameBtn = page.getByRole('button', { name: 'Letter Deduction' });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: 'Letter Deduction' })).toBeVisible();

        // Check for keyboard (should have 26 letters approx)
        const keys = page.locator('.keyboard button');
        const count = await keys.count();
        expect(count).toBeGreaterThan(20);

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: 'Back' });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Arcade 🕹️')).toBeVisible();
    });

    test('should play Word Scramble game', async ({ page }) => {
        // 1. Navigate to Arcade
        const arcadeBtn = page.getByRole('button', { name: 'Arcade' });
        await expect(arcadeBtn).toBeVisible();
        await arcadeBtn.click();

        // 2. Select Word Scramble
        const gameBtn = page.getByRole('button', { name: 'Word Scramble' });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: 'Word Scramble' })).toBeVisible();

        // Check for scrambled letters (should be at least 3)
        // The container for scrambled letters is the 5th child (Header, h2, p, GuessArea, ScrambledArea)
        const letters = page.locator('.word-scramble-game > div:nth-child(5) button');
        const count = await letters.count();
        expect(count).toBeGreaterThan(2);

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: 'Back' });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Arcade 🕹️')).toBeVisible();
    });

    test('should play Word Ladder game', async ({ page }) => {
        // 1. Navigate to Arcade
        const arcadeBtn = page.getByRole('button', { name: 'Arcade' });
        await expect(arcadeBtn).toBeVisible();
        await arcadeBtn.click();

        // 2. Select Word Ladder
        const gameBtn = page.getByRole('button', { name: 'Word Ladder' });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: 'Word Ladder' })).toBeVisible();

        // Check for start/end words
        await expect(page.getByText('Transform')).toBeVisible();
        await expect(page.getByText('to')).toBeVisible();

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: 'Back' });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Arcade 🕹️')).toBeVisible();
    });
});

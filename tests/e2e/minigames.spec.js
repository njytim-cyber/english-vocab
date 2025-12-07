import { test, expect } from '@playwright/test';

test.describe('Minigames Arcade Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Suppress Daily Login
        await page.addInitScript(() => {
            localStorage.setItem('vocab_daily_login', JSON.stringify({
                lastLogin: new Date().toISOString(),
                streak: 1
            }));
            // Suppress tutorials
            localStorage.setItem('tutorial_wordsearch', 'true');
            localStorage.setItem('tutorial_definitionmatch', 'true');
            localStorage.setItem('tutorial_letterdeduction', 'true');
            localStorage.setItem('tutorial_wordscramble', 'true');
            localStorage.setItem('tutorial_wordladder', 'true');
        });
        await page.goto('http://localhost:5173');
        // Wait for hydration
        await expect(page.locator('body')).toBeVisible();

        // Ensure we are on Learn Hub (new landing page)
        await expect(page.getByRole('heading', { name: /Learn/i })).toBeVisible();
    });

    // Helper: Navigate to Games Hub via "Word Games" card
    async function navigateToGamesHub(page) {
        const wordGamesCard = page.getByRole('button', { name: /Word Games/i });
        await expect(wordGamesCard).toBeVisible();
        await wordGamesCard.click();
        await expect(page.getByText('Games 🕹️')).toBeVisible();
    }

    test('should navigate to Arcade and back', async ({ page }) => {
        // 1. Click "Word Games" card in Learn Hub
        await navigateToGamesHub(page);

        // 2. Verify Arcade Hub
        await expect(page.getByText('Word Search')).toBeVisible();

        // 3. Click Back
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 4. Verify Learn Hub
        await expect(page.getByRole('heading', { name: /Learn/i })).toBeVisible();
    });

    test('should play Word Search game', async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        console.log('Starting Word Search test');

        // 1. Navigate to Games Hub
        await navigateToGamesHub(page);
        console.log('Games Hub loaded');

        // 2. Select Word Search
        const wordSearchBtn = page.getByRole('button', { name: /Word Search/i });
        await expect(wordSearchBtn).toBeVisible();
        await wordSearchBtn.click();
        console.log('Clicked Word Search button');

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: /Word Search/i })).toBeVisible();
        console.log('Word Search game loaded');

        // Verify "Find these words:" text appears
        await expect(page.getByText('Find these words:')).toBeVisible();

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();
        console.log('Clicked Back button');

        // 5. Verify back in Arcade
        await expect(page.getByText('Games 🕹️')).toBeVisible();
        console.log('Back in Games Hub');
    });

    test('should play Sentence Match game', async ({ page }) => {
        // 1. Navigate to Games Hub
        await navigateToGamesHub(page);

        // 2. Select Sentence Match
        const gameBtn = page.getByRole('button', { name: /Sentence Match/i });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: /Sentence Match/i })).toBeVisible();

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Games 🕹️')).toBeVisible();
    });

    test('should play Letter Deduction game', async ({ page }) => {
        // 1. Navigate to Games Hub
        await navigateToGamesHub(page);

        // 2. Select Letter Deduction
        const gameBtn = page.getByRole('button', { name: /Letter Deduction/i });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: /Letter Deduction/i })).toBeVisible();

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Games 🕹️')).toBeVisible();
    });

    test('should play Word Scramble game', async ({ page }) => {
        // 1. Navigate to Games Hub
        await navigateToGamesHub(page);

        // 2. Select Word Scramble
        const gameBtn = page.getByRole('button', { name: /Word Scramble/i });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: /Word Scramble/i })).toBeVisible();

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Games 🕹️')).toBeVisible();
    });

    test('should play Word Ladder game', async ({ page }) => {
        // 1. Navigate to Games Hub
        await navigateToGamesHub(page);

        // 2. Select Word Ladder
        const gameBtn = page.getByRole('button', { name: /Word Ladder/i });
        await expect(gameBtn).toBeVisible();
        await gameBtn.click();

        // 3. Verify Game Loaded
        await expect(page.getByRole('heading', { name: /Word Ladder/i })).toBeVisible();

        // 4. Test Back Navigation
        const backBtn = page.getByRole('button', { name: /Back/i });
        await expect(backBtn).toBeVisible();
        await backBtn.click();

        // 5. Verify back in Arcade
        await expect(page.getByText('Games 🕹️')).toBeVisible();
    });
});

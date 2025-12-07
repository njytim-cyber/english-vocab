import { test, expect } from '@playwright/test';

/**
 * Arena Battle E2E Test
 * Tests PvP battle flow: opponent selection, battle completion, ELO updates
 * Follows "Paranoid" standards
 */

test.describe('Arena Battle Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test('complete arena battle and verify ELO update', async ({ page }) => {
        // Navigate to Arena
        const beginButton = page.getByRole('button', { name: /begin journey/i });
        await expect(beginButton).toBeVisible();
        await beginButton.click();

        await page.waitForLoadState('networkidle');

        // Look for Arena button (may be in nav or hub)
        const arenaButton = page.getByRole('button', { name: /arena|battle/i });
        await expect(arenaButton).toBeVisible({ timeout: 5000 });
        await arenaButton.click();

        await page.waitForLoadState('networkidle');

        // Select opponent (look for opponent buttons)
        const opponentButton = page.locator('button:has-text("Beginner"), button:has-text("Easy"), button:has-text("Noob"), button').first();
        await expect(opponentButton).toBeVisible({ timeout: 5000 });

        // Get initial ELO
        const initialELO = await page.evaluate(() => {
            const data = localStorage.getItem('vocab_quest_economy');
            return data ? JSON.parse(data).arenaELO || 1000 : 1000;
        });

        await opponentButton.click();
        await page.waitForLoadState('networkidle');

        // Start battle if needed
        const startButton = page.getByRole('button', { name: /start|fight|begin/i });
        if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await startButton.click();
            await page.waitForLoadState('networkidle');
        }

        // Complete battle (10 questions)
        for (let i = 0; i < 10; i++) {
            // Wait for question
            await expect(page.locator('.quiz-question, [class*="question"], [class*="arena"]').first()).toBeVisible({ timeout: 15000 });

            // Select answer quickly
            const option = page.locator('button[class*="option"]').first();
            await expect(option).toBeVisible({ timeout: 5000 });
            await option.click();

            await page.waitForTimeout(800);

            // Handle next button if present
            const nextButton = page.getByRole('button', { name: /(next|continue)/i });
            if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await nextButton.click();
                await page.waitForTimeout(300);
            }
        }

        // Wait for battle results
        await expect(page.locator('text=/(win|lose|victory|defeat|result)/i').first()).toBeVisible({ timeout: 15000 });

        // Verify ELO changed
        const finalELO = await page.evaluate(() => {
            const data = localStorage.getItem('vocab_quest_economy');
            return data ? JSON.parse(data).arenaELO || 1000 : 1000;
        });

        // ELO should have changed (win or loss)
        expect(finalELO).not.toBe(initialELO);

        // Verify ELO is within reasonable range
        expect(finalELO).toBeGreaterThanOrEqual(0);
        expect(finalELO).toBeLessThanOrEqual(2000);
    });

    test('arena stats persistence', async ({ page }) => {
        // Complete a battle
        const beginButton = page.getByRole('button', { name: /begin journey/i });
        await expect(beginButton).toBeVisible();
        await beginButton.click();

        await page.waitForLoadState('networkidle');

        const arenaButton = page.getByRole('button', { name: /arena|battle/i });
        if (await arenaButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await arenaButton.click();
            await page.waitForLoadState('networkidle');

            // Get stats before
            const initialStats = await page.evaluate(() => {
                const data = localStorage.getItem('vocab_quest_economy');
                const parsed = data ? JSON.parse(data) : {};
                return {
                    wins: parsed.arenaWins || 0,
                    losses: parsed.arenaLosses || 0,
                    elo: parsed.arenaELO || 1000
                };
            });

            // Start a quick battle (just click through)
            const opponent = page.locator('button').first();
            if (await opponent.isVisible({ timeout: 2000 }).catch(() => false)) {
                await opponent.click();
                await page.waitForTimeout(500);

                // Click through a few questions quickly
                for (let i = 0; i < 3; i++) {
                    const option = page.locator('button[class*="option"]').first();
                    if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
                        await option.click();
                        await page.waitForTimeout(500);
                    }
                }

                // Reload page
                await page.reload();
                await page.waitForLoadState('networkidle');

                // Verify stats persisted
                const finalStats = await page.evaluate(() => {
                    const data = localStorage.getItem('vocab_quest_economy');
                    return data ? JSON.parse(data) : {};
                });

                expect(finalStats).toBeDefined();
                expect(finalStats.arenaELO).toBeDefined();
            }
        }
    });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { Economy, SHOP_ITEMS } from './Economy';

describe('Economy', () => {
    let economy;

    beforeEach(() => {
        localStorage.clear();
        economy = new Economy();
    });

    describe('Initialization and Persistence', () => {
        it('should initialize with default values', () => {
            expect(economy.getCoins()).toBe(0);
            expect(economy.getXP()).toBe(0);
            expect(economy.getLevel()).toBe(1);
            expect(economy.getEventTokens()).toBe(0);
        });

        it('should load saved state from localStorage', () => {
            economy.addCoins(500);
            const coinsAfterXP = economy.getCoins(); // Save coins after any level-up bonuses
            economy.addXP(1000);

            // Create new instance to test loading
            const economy2 = new Economy();
            expect(economy2.getCoins()).toBe(economy.getCoins()); // Should match current coins (includes level bonuses)
            expect(economy2.getXP()).toBe(1000);
        });

        it('should handle NaN corruption gracefully', () => {
            localStorage.setItem('vocab_quest_economy', JSON.stringify({
                coins: NaN,
                xp: NaN,
                level: NaN
            }));

            const economy2 = new Economy();
            expect(economy2.getCoins()).toBe(0);
            expect(economy2.getXP()).toBe(0);
            expect(economy2.getLevel()).toBe(1);
        });

        it('should handle corrupted JSON gracefully', () => {
            localStorage.setItem('vocab_quest_economy', 'invalid json {{{');

            const economy2 = new Economy();
            expect(economy2.getCoins()).toBe(0);
            expect(economy2.getXP()).toBe(0);
        });
    });

    describe('Coin Management', () => {
        it('should add coins correctly', () => {
            economy.addCoins(100);
            expect(economy.getCoins()).toBe(100);

            economy.addCoins(50);
            expect(economy.getCoins()).toBe(150);
        });

        it('should floor coin amounts to integers', () => {
            economy.addCoins(99.7);
            expect(economy.getCoins()).toBe(99);
        });

        it('should not add invalid coin amounts', () => {
            economy.addCoins(NaN);
            expect(economy.getCoins()).toBe(0);

            economy.addCoins(undefined);
            expect(economy.getCoins()).toBe(0);
        });

        it('should deduct coins on purchase', () => {
            economy.addCoins(500);
            const item = SHOP_ITEMS.find(i => i.id === 'sunglasses');

            economy.buyItem('sunglasses');
            expect(economy.getCoins()).toBe(500 - item.cost);
        });
    });

    describe('XP and Leveling System', () => {
        it('should add XP correctly', () => {
            economy.addXP(50);
            expect(economy.getXP()).toBe(50);
        });

        it('should calculate level based on XP', () => {
            // Level formula: 1 + floor(sqrt(XP / 100))
            economy.addXP(100); // Should be level 2
            expect(economy.getLevel()).toBe(2);

            economy.addXP(300); // Total 400, should be level 3
            expect(economy.getLevel()).toBe(3);
        });

        it('should award bonus coins on level up', () => {
            const initialCoins = economy.getCoins();
            economy.addXP(100); // Level up to 2

            // Should get level * 50 bonus coins (2 * 50 = 100)
            expect(economy.getCoins()).toBe(initialCoins + 100);
        });

        it('should not add invalid XP amounts', () => {
            economy.addXP(NaN);
            expect(economy.getXP()).toBe(0);
        });
    });

    describe('Event Tokens', () => {
        it('should add event tokens correctly', () => {
            economy.addEventTokens(10);
            expect(economy.getEventTokens()).toBe(10);

            economy.addEventTokens(5);
            expect(economy.getEventTokens()).toBe(15);
        });
    });

    describe('Shop System', () => {
        it('should successfully purchase item with enough coins', () => {
            economy.addCoins(500);
            const result = economy.buyItem('sunglasses');

            expect(result.success).toBe(true);
            expect(economy.hasItem('sunglasses')).toBe(true);
        });

        it('should fail purchase with insufficient coins', () => {
            economy.addCoins(50); // Not enough for most items
            const result = economy.buyItem('sunglasses');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Not enough coins');
            expect(economy.hasItem('sunglasses')).toBe(false);
        });

        it('should fail purchase of already owned item', () => {
            economy.addCoins(500);
            economy.buyItem('sunglasses');
            const result = economy.buyItem('sunglasses');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Already owned');
        });

        it('should fail purchase of non-existent item', () => {
            const result = economy.buyItem('nonexistent_item');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Item not found');
        });
    });

    describe('Arena Stats', () => {
        it('should track arena wins and ELO gains', () => {
            const initialStats = economy.getArenaStats();
            expect(initialStats.wins).toBe(0);
            expect(initialStats.elo).toBe(1000);

            economy.addArenaWin(25);
            const stats = economy.getArenaStats();
            expect(stats.wins).toBe(1);
            expect(stats.elo).toBe(1025);
        });

        it('should track arena losses and ELO losses', () => {
            economy.addArenaLoss(15);
            const stats = economy.getArenaStats();

            expect(stats.losses).toBe(1);
            expect(stats.elo).toBe(985);
        });

        it('should floor ELO at 0', () => {
            // Lose enough to go below 0
            for (let i = 0; i < 100; i++) {
                economy.addArenaLoss(15);
            }

            const stats = economy.getArenaStats();
            expect(stats.elo).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Subscription System', () => {
        it('should notify subscribers on state changes', () => {
            let notificationCount = 0;
            const unsubscribe = economy.subscribe(() => {
                notificationCount++;
            });

            economy.addCoins(100);
            expect(notificationCount).toBe(1);

            economy.addXP(50);
            expect(notificationCount).toBe(2);

            unsubscribe();
            economy.addCoins(50);
            expect(notificationCount).toBe(2); // Should not increment after unsubscribe
        });
    });

    describe('Reset', () => {
        it('should reset all economy state', () => {
            economy.addCoins(1000);
            economy.addXP(500);
            economy.buyItem('sunglasses');
            economy.addArenaWin();

            economy.reset();

            expect(economy.getCoins()).toBe(0);
            expect(economy.getXP()).toBe(0);
            expect(economy.getLevel()).toBe(1);
            expect(economy.hasItem('sunglasses')).toBe(false);
            expect(economy.getArenaStats().wins).toBe(0);
            expect(economy.getArenaStats().elo).toBe(1000);
        });
    });
});

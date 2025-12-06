
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Economy } from './Economy';

describe('Economy System', () => {
    let economy;

    beforeEach(() => {
        // Mock localStorage
        const store = {};
        vi.stubGlobal('localStorage', {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value; }
        });

        economy = new Economy();
    });

    it('should initialize with default values', () => {
        expect(economy.getCoins()).toBe(0);
        expect(economy.getXP()).toBe(0);
        expect(economy.getLevel()).toBe(1);
    });

    it('should add coins correctly', () => {
        economy.addCoins(100);
        expect(economy.getCoins()).toBe(100);

        economy.addCoins(50);
        expect(economy.getCoins()).toBe(150);
    });

    it('should prevent NaN corruption in addCoins', () => {
        economy.addCoins(NaN);
        expect(economy.getCoins()).toBe(0);

        economy.addCoins(undefined);
        expect(economy.getCoins()).toBe(0);

        economy.addCoins('not a number');
        expect(economy.getCoins()).toBe(0);
    });

    it('should level up when enough XP is gained', () => {
        // Level 2 requires 100 XP (sqrt(100/100) + 1 = 2)
        economy.addXP(100);
        expect(economy.getLevel()).toBe(2);
        expect(economy.getXP()).toBe(100);

        // Check bonus coins (Level 2 * 50 = 100 coins)
        expect(economy.getCoins()).toBe(100);
    });

    it('should recover from corrupted NaN state on load', () => {
        // Simulate corrupted storage
        vi.stubGlobal('localStorage', {
            getItem: () => JSON.stringify({ coins: NaN, xp: NaN, level: NaN, inventory: [] }),
            setItem: () => { }
        });

        const recoveredEconomy = new Economy();
        expect(recoveredEconomy.getCoins()).toBe(0);
        expect(recoveredEconomy.getXP()).toBe(0);
        expect(recoveredEconomy.getLevel()).toBe(1);
    });
});


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
        // Simulate corrupted storage with fresh mock
        const corruptedStore = { 'vocab_quest_economy': JSON.stringify({ coins: NaN, xp: NaN, level: NaN, inventory: [] }) };
        vi.stubGlobal('localStorage', {
            getItem: (key) => corruptedStore[key] || null,
            setItem: (key, value) => { corruptedStore[key] = value; }
        });

        const recoveredEconomy = new Economy();
        expect(recoveredEconomy.getCoins()).toBe(0);
        expect(recoveredEconomy.getXP()).toBe(0);
        expect(recoveredEconomy.getLevel()).toBe(1);
    });

    it('should track arena wins and ELO gains', () => {
        const stats = economy.getArenaStats();
        expect(stats.wins).toBe(0);
        expect(stats.losses).toBe(0);
        expect(stats.elo).toBe(1000);

        economy.addArenaWin(25);
        const updated = economy.getArenaStats();
        expect(updated.wins).toBe(1);
        expect(updated.elo).toBe(1025);
    });

    it('should track arena losses and ELO losses', () => {
        economy.addArenaLoss(15);
        const stats = economy.getArenaStats();
        expect(stats.losses).toBe(1);
        expect(stats.elo).toBe(985);
    });

    it('should prevent ELO from going below 0', () => {
        economy.addArenaLoss(2000); // Massive loss
        const stats = economy.getArenaStats();
        expect(stats.elo).toBe(0);
    });
});

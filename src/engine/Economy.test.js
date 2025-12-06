import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Economy, SHOP_ITEMS } from './Economy';

describe('Economy System', () => {
    let economy;

    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn()
        };
        economy = new Economy();
    });

    it('should initialize with default state', () => {
        expect(economy.getCoins()).toBe(0);
        expect(economy.getXP()).toBe(0);
        expect(economy.getLevel()).toBe(1);
    });

    it('should add coins and save', () => {
        economy.addCoins(100);
        expect(economy.getCoins()).toBe(100);
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle purchases', () => {
        economy.addCoins(500);
        const item = SHOP_ITEMS[0]; // Cost 100

        const result = economy.buyItem(item.id);

        expect(result.success).toBe(true);
        expect(economy.getCoins()).toBe(400);
        expect(economy.hasItem(item.id)).toBe(true);
    });

    it('should calculate level up correctly', () => {
        // Level 2 requires 100 XP
        economy.addXP(50);
        expect(economy.getXP()).toBe(50);
        expect(economy.getLevel()).toBe(1);

        economy.addXP(50); // Total 100
        expect(economy.getXP()).toBe(100);
        expect(economy.getLevel()).toBe(2);

        // Check level up reward (Level 2 * 50 = 100 coins)
        expect(economy.getCoins()).toBe(100);
    });

    it('should notify subscribers on updates', () => {
        const listener = vi.fn();
        const unsubscribe = economy.subscribe(listener);

        economy.addCoins(10);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ coins: 10 }));

        unsubscribe();
        economy.addCoins(10);
        expect(listener).toHaveBeenCalledTimes(1); // No new calls
    });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Economy, SHOP_ITEMS } from './Economy';

describe('Economy', () => {
    let economy;

    beforeEach(() => {
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn()
        };
        economy = new Economy();
    });

    it('starts with 0 coins', () => {
        expect(economy.getCoins()).toBe(0);
    });

    it('adds coins correctly', () => {
        economy.addCoins(100);
        expect(economy.getCoins()).toBe(100);
    });

    it('buys item if enough coins', () => {
        economy.addCoins(200);
        const result = economy.buyItem('sunglasses'); // Cost 100

        expect(result.success).toBe(true);
        expect(economy.getCoins()).toBe(100);
        expect(economy.hasItem('sunglasses')).toBe(true);
    });

    it('fails to buy if not enough coins', () => {
        economy.addCoins(50);
        const result = economy.buyItem('sunglasses'); // Cost 100

        expect(result.success).toBe(false);
        expect(economy.getCoins()).toBe(50);
        expect(economy.hasItem('sunglasses')).toBe(false);
    });

    it('fails to buy if already owned', () => {
        economy.addCoins(200);
        economy.buyItem('sunglasses');
        const result = economy.buyItem('sunglasses');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Already owned');
    });
});

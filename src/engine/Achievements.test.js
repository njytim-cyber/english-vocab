
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Achievements, ACHIEVEMENTS } from './Achievements';

describe('Achievements', () => {
    let achievements;
    const STORAGE_KEY = 'vocab_achievements';

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
        });
        achievements = new Achievements();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with empty state if no storage', () => {
        expect(achievements.getUnlocked()).toEqual([]);
        expect(achievements.stats.wins).toBe(0);
    });

    it('should unlock First Victory when wins >= 1', () => {
        const updates = { wins: 1 };
        const unlocks = achievements.updateStats(updates);

        expect(unlocks).toHaveLength(1);
        expect(unlocks[0].id).toBe('first_win');
        expect(achievements.unlocked.has('first_win')).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not unlock if condition not met', () => {
        // Quiz Master requires 10 wins
        achievements.updateStats({ wins: 5 });
        expect(achievements.unlocked.has('quiz_master')).toBe(false);
    });

    it('should unlock specialized achievements (Speed Demon)', () => {
        const unlocks = achievements.updateStats({ fastAnswers: 5 });
        expect(unlocks).toHaveLength(1);
        expect(unlocks[0].id).toBe('speed_demon');
    });

    it('should accumulate stats correctly', () => {
        achievements.updateStats({ totalCoins: 50 });
        achievements.updateStats({ totalCoins: 50 });
        expect(achievements.stats.totalCoins).toBe(100);
    });

    it('should persist unlocks to localStorage', () => {
        achievements.updateStats({ wins: 1 });
        expect(localStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEY,
            expect.stringContaining('first_win')
        );
    });
});

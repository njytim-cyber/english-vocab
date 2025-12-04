import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpacedRepetition } from './SpacedRepetition';

describe('SpacedRepetition', () => {
    let sr;

    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn()
        };
        sr = new SpacedRepetition();
    });

    it('starts new items in Box 1', () => {
        expect(sr.getBox(1)).toBe(1);
    });

    it('promotes item on correct answer', () => {
        sr.updateProgress(1, true);
        expect(sr.getBox(1)).toBe(2);

        sr.updateProgress(1, true);
        expect(sr.getBox(1)).toBe(3);
    });

    it('demotes item to Box 1 on incorrect answer', () => {
        // Manually set to Box 3
        sr.progress[1] = { box: 3 };

        sr.updateProgress(1, false);
        expect(sr.getBox(1)).toBe(1);
    });

    it('caps promotion at Box 5', () => {
        sr.progress[1] = { box: 5 };
        sr.updateProgress(1, true);
        expect(sr.getBox(1)).toBe(5);
    });

    it('prioritizes lower boxes', () => {
        const questions = [
            { id: 1 }, // Box 3 (set below)
            { id: 2 }, // Box 1 (default)
            { id: 3 }  // Box 5 (set below)
        ];

        sr.progress[1] = { box: 3 };
        sr.progress[3] = { box: 5 };

        const sorted = sr.prioritizeQuestions(questions);

        expect(sorted[0].id).toBe(2); // Box 1
        expect(sorted[1].id).toBe(1); // Box 3
        expect(sorted[2].id).toBe(3); // Box 5
    });
});

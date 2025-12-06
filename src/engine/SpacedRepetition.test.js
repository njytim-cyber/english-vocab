
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SpacedRepetition } from './SpacedRepetition';

describe('SpacedRepetition', () => {
    let sr;

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
        });
        sr = new SpacedRepetition();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with empty progress if no storage', () => {
        expect(sr.progress).toEqual({});
    });

    it('should default to Box 1 for new items', () => {
        expect(sr.getBox(999)).toBe(1);
    });

    it('should promote item on correct answer', () => {
        // Box 1 -> 2
        const nextBox = sr.updateProgress(101, true);
        expect(nextBox).toBe(2);
        expect(sr.getBox(101)).toBe(2);
    });

    it('should cap promotion at Box 5', () => {
        sr.setBox(101, 5);
        const nextBox = sr.updateProgress(101, true);
        expect(nextBox).toBe(5);
    });

    it('should reset to Box 1 on wrong answer', () => {
        sr.setBox(102, 4);
        const nextBox = sr.updateProgress(102, false);
        expect(nextBox).toBe(1);
        expect(sr.getBox(102)).toBe(1);
    });

    it('should prioritize lower boxes first', () => {
        const questions = [
            { id: 1 }, // Box 1 (default)
            { id: 2 }, // Box 3
            { id: 3 }  // Box 5
        ];

        sr.setBox(2, 3);
        sr.setBox(3, 5);
        sr.setBox(1, 1); // Explicitly set or default

        const sorted = sr.prioritizeQuestions(questions);

        expect(sorted[0].id).toBe(1);
        expect(sorted[1].id).toBe(2);
        expect(sorted[2].id).toBe(3);
    });
});

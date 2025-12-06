import { describe, it, expect } from 'vitest';

/**
 * Test for difficulty filter logic in SkillTreeView
 * Bug: When difficulty filter is set (e.g., 8-9), questions with undefined 
 * difficulty or low difficulty (e.g., 2) were incorrectly showing.
 * 
 * Root cause: `undefined < 8` evaluates to `false` in JavaScript,
 * so questions without difficulty would bypass the filter.
 * 
 * Fix: Use nullish coalescing to default undefined to 0.
 */

describe('SkillTreeView Difficulty Filter', () => {
    // Simulates the filter logic from SkillTreeView
    const filterByDifficulty = (questions, minDifficulty, maxDifficulty) => {
        return questions.filter(q => {
            const difficulty = q.difficulty ?? 0;
            return difficulty >= minDifficulty && difficulty <= maxDifficulty;
        });
    };

    it('should exclude questions with undefined difficulty when filter is 8-9', () => {
        const questions = [
            { id: 1, answer: 'effulgent', difficulty: 9 },
            { id: 2, answer: 'ski', difficulty: 2 },
            { id: 3, answer: 'magnanimous', difficulty: 8 },
            { id: 4, answer: 'unknown' }, // No difficulty
        ];

        const filtered = filterByDifficulty(questions, 8, 9);

        expect(filtered).toHaveLength(2);
        expect(filtered.map(q => q.answer)).toEqual(['effulgent', 'magnanimous']);
        expect(filtered.find(q => q.answer === 'ski')).toBeUndefined();
        expect(filtered.find(q => q.answer === 'unknown')).toBeUndefined();
    });

    it('should include questions with difficulty exactly at boundaries', () => {
        const questions = [
            { id: 1, answer: 'word1', difficulty: 5 },
            { id: 2, answer: 'word2', difficulty: 7 },
            { id: 3, answer: 'word3', difficulty: 4 },
        ];

        const filtered = filterByDifficulty(questions, 5, 7);

        expect(filtered).toHaveLength(2);
        expect(filtered.map(q => q.answer)).toContain('word1');
        expect(filtered.map(q => q.answer)).toContain('word2');
        expect(filtered.map(q => q.answer)).not.toContain('word3');
    });

    it('should handle questions with difficulty 0 correctly', () => {
        const questions = [
            { id: 1, answer: 'word1', difficulty: 0 },
            { id: 2, answer: 'word2', difficulty: 1 },
        ];

        // Filter 1-10 should exclude difficulty 0
        const filtered1 = filterByDifficulty(questions, 1, 10);
        expect(filtered1).toHaveLength(1);
        expect(filtered1[0].answer).toBe('word2');

        // Filter 0-10 should include difficulty 0
        const filtered2 = filterByDifficulty(questions, 0, 10);
        expect(filtered2).toHaveLength(2);
    });

    it('should treat undefined difficulty as 0', () => {
        const questions = [
            { id: 1, answer: 'word1' }, // undefined difficulty
            { id: 2, answer: 'word2', difficulty: undefined },
            { id: 3, answer: 'word3', difficulty: null }, // null should also be 0
        ];

        // With nullish coalescing, undefined becomes 0
        // null also becomes 0 with ??
        const filtered = filterByDifficulty(questions, 1, 10);
        expect(filtered).toHaveLength(0);
    });

    it('should include all difficulties when range is 1-10', () => {
        const questions = [
            { id: 1, difficulty: 1 },
            { id: 2, difficulty: 5 },
            { id: 3, difficulty: 10 },
            { id: 4 }, // undefined - excluded
        ];

        const filtered = filterByDifficulty(questions, 1, 10);
        expect(filtered).toHaveLength(3);
    });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizEngine } from './QuizEngine';

const mockQuestions = [
    {
        question_number: 1,
        question: "Q1",
        options: { "1": "A", "2": "B" },
        answer: "A",
        answer_index: 1
    },
    {
        question_number: 2,
        question: "Q2",
        options: { "1": "C", "2": "D" },
        answer: "C",
        answer_index: 1
    }
];

describe('QuizEngine', () => {
    let engine;

    beforeEach(() => {
        // Mock localStorage for SpacedRepetition
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn()
        };
        engine = new QuizEngine(mockQuestions);
    });

    it('initializes with correct state', () => {
        const state = engine.getState();
        expect(state.currentQuestionIndex).toBe(0);
        expect(state.score).toBe(0);
        expect(state.streak).toBe(0);
        expect(state.isFinished).toBe(false);
    });

    it('normalizes current question correctly', () => {
        const q = engine.getCurrentQuestion();
        expect(q.id).toBe(1);
        expect(q.question).toBe("Q1");
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options).toEqual(["A", "B"]);
    });

    it('handles correct answer correctly', () => {
        const isCorrect = engine.answer('A');
        expect(isCorrect).toBe(true);

        const state = engine.getState();
        expect(state.score).toBe(10);
        expect(state.streak).toBe(1);
        expect(state.xp).toBeGreaterThan(10); // Base + Streak bonus
        expect(state.currentQuestionIndex).toBe(1);
    });

    it('handles incorrect answer correctly', () => {
        const isCorrect = engine.answer('B');
        expect(isCorrect).toBe(false);

        const state = engine.getState();
        expect(state.score).toBe(0);
        expect(state.streak).toBe(0);
        expect(state.currentQuestionIndex).toBe(1);
    });

    it('finishes the quiz', () => {
        engine.answer('A'); // Q1
        engine.answer('C'); // Q2

        const state = engine.getState();
        expect(state.isFinished).toBe(true);
        expect(engine.getCurrentQuestion()).toBeNull();
    });

    it('randomizes reinforcement questions within the same box', () => {
        // Create a set of questions that will all be in box 0 (default)
        const manyQuestions = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            question_number: i,
            question: `Q${i}`,
            answer: `A${i}`,
            options: ["A", "B"]
        }));

        const randomEngine = new QuizEngine(manyQuestions);

        // Mock getBox to always return 0
        randomEngine.sr.getBox = vi.fn().mockReturnValue(0);

        const run1 = randomEngine.getReinforcementQuestions(5);
        const run2 = randomEngine.getReinforcementQuestions(5);

        // Check that we got 5 questions
        expect(run1.length).toBe(5);
        expect(run2.length).toBe(5);

        // Check that the sets are likely different (probability of identical sets is very low)
        const ids1 = run1.map(q => q.id).sort().join(',');
        const ids2 = run2.map(q => q.id).sort().join(',');

        expect(ids1).not.toBe(ids2);
    });
});

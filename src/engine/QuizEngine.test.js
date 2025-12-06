import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizEngine } from './QuizEngine';

const mockQuestions = [
    {
        id: 1,
        question_number: 1,
        question: "Q1",
        options: { "1": "A", "2": "B" },
        answer: "A",
        answer_index: 1
    },
    {
        id: 2,
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
        expect(q.question_number).toBe(1);
        expect(q.question).toBe("Q1");
        const options = Array.isArray(q.options) ? q.options : Object.values(q.options);
        expect(options).toEqual(["A", "B"]);
    });

    it('handles correct answer correctly', () => {
        const q = engine.getCurrentQuestion();
        const isCorrect = engine.answer(q.answer);
        expect(isCorrect).toBe(true);

        const state = engine.getState();
        expect(state.score).toBe(10);
        expect(state.streak).toBe(1);
        expect(state.xp).toBeGreaterThan(10); // Base + Streak bonus
        expect(state.currentQuestionIndex).toBe(1);
    });

    it('handles incorrect answer correctly', () => {
        const q = engine.getCurrentQuestion();
        // Find an option that is NOT the answer
        const wrongAnswer = Object.values(q.options).find(o => o !== q.answer) || "WRONG";
        const isCorrect = engine.answer(wrongAnswer);
        expect(isCorrect).toBe(false);

        const state = engine.getState();
        expect(state.score).toBe(0);
        expect(state.streak).toBe(0);
        expect(state.currentQuestionIndex).toBe(1);
    });

    it('finishes the quiz', () => {
        // Answer all questions
        let q = engine.getCurrentQuestion();
        while (q) {
            engine.answer(q.answer);
            q = engine.getCurrentQuestion();
        }

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

    describe('Revision Logic', () => {
        it('getRevisionList returns questions in Box 1', () => {
            // Mock getBox to return 1 for Q1 and 2 for Q2
            engine.sr.getBox = vi.fn((id) => id === 1 ? 1 : 2);

            const list = engine.getRevisionList();
            expect(list).toHaveLength(1);
            expect(list[0].id).toBe(1);
        });

        it('processRevisionAnswer boosts to Box 4 on success', () => {
            engine.sr.setBox = vi.fn();
            const result = engine.processRevisionAnswer(1, true);
            expect(result).toBe(true);
            expect(engine.sr.setBox).toHaveBeenCalledWith(1, 4);
        });

        it('processRevisionAnswer resets to Box 1 on failure', () => {
            engine.sr.updateProgress = vi.fn();
            const result = engine.processRevisionAnswer(1, false);
            expect(result).toBe(false);
            expect(engine.sr.updateProgress).toHaveBeenCalledWith(1, false);
        });
    });
});

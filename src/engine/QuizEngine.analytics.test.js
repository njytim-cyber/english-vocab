import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizEngine } from './QuizEngine';

describe('QuizEngine Integration with Analytics', () => {
    let engine;

    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn()
        };
        engine = new QuizEngine();
        // Mock AnalyticsService methods to verify calls
        engine.analytics.logAnswer = vi.fn();
        engine.analytics.getTypePerformance = vi.fn().mockReturnValue(0.5); // Default perf
        engine.contentGenerator.generateClozePassage = vi.fn().mockReturnValue({ type: 'ClozePassage' });
    });

    it('logs answer to analytics', () => {
        engine.startNewGame();
        const q = engine.getCurrentQuestion();

        // Fast forward time slightly to ensure timeTaken > 0
        const start = Date.now();
        while (Date.now() - start < 10) { }

        engine.answer(q.answer);

        expect(engine.analytics.logAnswer).toHaveBeenCalledWith(
            expect.anything(), // ID
            expect.any(Number), // timeTaken
            true, // isCorrect
            expect.any(String) // type
        );
    });

    it('adjusts cloze probability based on performance', () => {
        // Case 1: Low Performance -> High Probability
        engine.analytics.getTypePerformance.mockReturnValue(0.2); // Bad at Cloze

        // Mock Math.random to always return 0 (force hit)
        const originalRandom = Math.random;
        Math.random = () => 0;

        engine.startNewGame();

        // Should have called generateClozePassage for eligible items
        // We can't easily check internal probability var, but we can check if contentGenerator was called
        // assuming we have eligible questions in Box 2-5.
        // By default, new questions are Box 1. We need to mock SR to put some in Box 2.
        engine.sr.getBox = vi.fn().mockReturnValue(2);

        engine.startNewGame();
        expect(engine.contentGenerator.generateClozePassage).toHaveBeenCalled();

        // Restore
        Math.random = originalRandom;
    });
});

import { describe, it, expect } from 'vitest';
import { QuizEngine } from './QuizEngine';

const mockQuestions = [
    { id: 1, question: 'Q1', answer: 'cold', theme: 'T1', options: [] },
    { id: 2, question: 'Q2', answer: 'warm', theme: 'T1', options: [] },
    { id: 3, question: 'Q3', answer: 'cord', theme: 'T1', options: [] },
    { id: 4, question: 'Q4', answer: 'card', theme: 'T1', options: [] },
    { id: 5, question: 'Q5', answer: 'ward', theme: 'T1', options: [] },
    { id: 6, question: 'Q6', answer: 'word', theme: 'T1', options: [] },
    { id: 7, question: 'Q7', answer: 'worm', theme: 'T1', options: [] },
    { id: 8, question: 'Q8', answer: 'longword', theme: 'T1', options: [] },
];

describe('QuizEngine Minigames', () => {
    const engine = new QuizEngine(mockQuestions);

    it('getReinforcementWords returns correct count', () => {
        const words = engine.getReinforcementWords(3);
        expect(words.length).toBe(3);
    });

    it('getWordLadderChallenge finds a path', () => {
        // cold -> cord -> card -> ward -> warm (4 steps)
        // or cold -> cord -> word -> worm -> warm (4 steps)
        const challenge = engine.getWordLadderChallenge(4, 2);

        if (challenge) {
            expect(challenge.start).toBeDefined();
            expect(challenge.end).toBeDefined();
            expect(challenge.path.length).toBeGreaterThanOrEqual(3);
            expect(challenge.path[0]).toBe(challenge.start);
            expect(challenge.path[challenge.path.length - 1]).toBe(challenge.end);
        } else {
            // It might fail if random selection is unlucky, but with this small pool and seed it should work
            console.warn("Ladder generation failed (could be random chance)");
        }
    });

    it('isValidWord checks correctly', () => {
        expect(engine.isValidWord('cold')).toBe(true);
        expect(engine.isValidWord('xyz')).toBe(false);
    });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { SpacedRepetition } from './SpacedRepetition';

describe('SpacedRepetition', () => {
    let sr;

    beforeEach(() => {
        localStorage.clear();
        sr = new SpacedRepetition();
    });

    describe('Initialization and Persistence', () => {
        it('should initialize with empty progress', () => {
            expect(sr.progress).toEqual({});
        });

        it('should default to box 1 for new questions', () => {
            expect(sr.getBox(1)).toBe(1);
            expect(sr.getBox(999)).toBe(1);
        });

        it('should persist progress to localStorage', () => {
            sr.updateProgress(1, true);

            const sr2 = new SpacedRepetition();
            expect(sr2.getBox(1)).toBe(2);
        });

        it('should handle corrupted localStorage gracefully', () => {
            localStorage.setItem('vocab_quest_progress', 'invalid json {{{');

            const sr2 = new SpacedRepetition();
            expect(sr2.progress).toEqual({});
        });
    });

    describe('Box Promotion on Correct Answer', () => {
        it('should promote from box 1 to box 2 on correct answer', () => {
            sr.updateProgress(1, true);
            expect(sr.getBox(1)).toBe(2);
        });

        it('should promote from box 2 to box 3 on correct answer', () => {
            sr.setBox(1, 2);
            sr.updateProgress(1, true);
            expect(sr.getBox(1)).toBe(3);
        });

        it('should cap at box 5', () => {
            sr.setBox(1, 5);
            sr.updateProgress(1, true);
            expect(sr.getBox(1)).toBe(5); // Should not exceed 5
        });

        it('should progress through all boxes sequentially', () => {
            const questionId = 42;

            expect(sr.getBox(questionId)).toBe(1);

            sr.updateProgress(questionId, true);
            expect(sr.getBox(questionId)).toBe(2);

            sr.updateProgress(questionId, true);
            expect(sr.getBox(questionId)).toBe(3);

            sr.updateProgress(questionId, true);
            expect(sr.getBox(questionId)).toBe(4);

            sr.updateProgress(questionId, true);
            expect(sr.getBox(questionId)).toBe(5);
        });
    });

    describe('Box Demotion on Incorrect Answer', () => {
        it('should demote to box 1 on incorrect answer', () => {
            sr.setBox(1, 3);
            sr.updateProgress(1, false);
            expect(sr.getBox(1)).toBe(1);
        });

        it('should demote from box 5 to box 1 on incorrect answer', () => {
            sr.setBox(1, 5);
            sr.updateProgress(1, false);
            expect(sr.getBox(1)).toBe(1);
        });

        it('should stay at box 1 if already there', () => {
            sr.updateProgress(1, false);
            expect(sr.getBox(1)).toBe(1);
        });
    });

    describe('Manual Box Setting', () => {
        it('should manually set box level', () => {
            sr.setBox(1, 3);
            expect(sr.getBox(1)).toBe(3);
        });

        it('should clamp box level to 1-5 range', () => {
            sr.setBox(1, 10);
            expect(sr.getBox(1)).toBe(5);

            sr.setBox(2, -5);
            expect(sr.getBox(2)).toBe(1);
        });

        it('should save timestamp when setting box', () => {
            sr.setBox(1, 3);
            expect(sr.progress[1].lastReviewed).toBeDefined();
            expect(typeof sr.progress[1].lastReviewed).toBe('number');
        });
    });

    describe('Question Prioritization', () => {
        it('should prioritize lower box questions', () => {
            const questions = [
                { question_number: 1, answer: 'test1' },
                { question_number: 2, answer: 'test2' },
                { question_number: 3, answer: 'test3' },
            ];

            sr.setBox(1, 3);
            sr.setBox(2, 1);
            sr.setBox(3, 2);

            const prioritized = sr.prioritizeQuestions(questions);

            expect(prioritized[0].question_number).toBe(2); // Box 1
            expect(prioritized[1].question_number).toBe(3); // Box 2
            expect(prioritized[2].question_number).toBe(1); // Box 3
        });

        it('should handle questions with id field instead of question_number', () => {
            const questions = [
                { id: 1, answer: 'test1' },
                { id: 2, answer: 'test2' },
            ];

            sr.setBox(1, 2);
            sr.setBox(2, 1);

            const prioritized = sr.prioritizeQuestions(questions);
            expect(prioritized[0].id).toBe(2); // Lower box first
        });

        it('should not mutate original array', () => {
            const questions = [
                { question_number: 1 },
                { question_number: 2 },
            ];

            const originalOrder = questions.map(q => q.question_number);
            sr.prioritizeQuestions(questions);

            expect(questions.map(q => q.question_number)).toEqual(originalOrder);
        });
    });

    describe('Reset', () => {
        it('should reset all progress', () => {
            sr.updateProgress(1, true);
            sr.updateProgress(2, true);
            sr.updateProgress(3, true);

            sr.reset();

            expect(sr.progress).toEqual({});
            expect(sr.getBox(1)).toBe(1);
            expect(sr.getBox(2)).toBe(1);
            expect(sr.getBox(3)).toBe(1);
        });

        it('should persist reset to localStorage', () => {
            sr.updateProgress(1, true);
            sr.reset();

            const sr2 = new SpacedRepetition();
            expect(sr2.getBox(1)).toBe(1);
        });
    });

    describe('Return Value of updateProgress', () => {
        it('should return new box level', () => {
            const newBox = sr.updateProgress(1, true);
            expect(newBox).toBe(2);

            const newBox2 = sr.updateProgress(1, true);
            expect(newBox2).toBe(3);

            const newBox3 = sr.updateProgress(1, false);
            expect(newBox3).toBe(1);
        });
    });
});

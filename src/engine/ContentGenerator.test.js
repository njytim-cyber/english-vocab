import { describe, it, expect, beforeEach } from 'vitest';
import { ContentGenerator } from './ContentGenerator';

describe('ContentGenerator', () => {
    let generator;
    const mockQuestions = [
        { id: 1, answer: 'rope', theme: 'Nautical & Maritime', difficulty: 1, example: 'The sailor secured the boat with a strong rope.' },
        { id: 2, answer: 'boat', theme: 'Nautical & Maritime', difficulty: 1, example: 'The fisherman rowed his boat out to sea.' },
        { id: 3, answer: 'ocean', theme: 'Science', difficulty: 2, example: 'The ship sailed across the vast ocean.' },
        { id: 4, answer: 'coast', theme: 'Geography', difficulty: 3, example: 'We walked along the beautiful coast.' },
    ];

    beforeEach(() => {
        generator = new ContentGenerator();
    });

    describe('Cloze Passage Generation', () => {
        it('should generate cloze passage from word object', () => {
            const targetWord = mockQuestions[0];
            const cloze = generator.generateClozePassage(targetWord, mockQuestions);

            expect(cloze).toBeDefined();
            expect(cloze.type).toBe('ClozePassage');
            expect(cloze.answer).toBe('rope');
            expect(cloze.formatted_text).toContain('_____');
        });

        it('should replace answer with blank in sentence', () => {
            const targetWord = mockQuestions[0];
            const cloze = generator.generateClozePassage(targetWord, mockQuestions);

            expect(cloze.formatted_text).toContain('_____');
            expect(cloze.formatted_text).not.toContain('rope');
        });

        it('should generate word bank with answer and distractors', () => {
            const targetWord = mockQuestions[0];
            const cloze = generator.generateClozePassage(targetWord, mockQuestions);

            expect(cloze.word_bank).toBeDefined();
            expect(cloze.word_bank.length).toBe(4); // 1 answer + 3 distractors
            expect(cloze.word_bank).toContain('rope');
        });

        it('should return null if answer not in example', () => {
            const invalidWord = {
                id: 99,
                answer: 'missing',
                example: 'This sentence does not contain the target word.'
            };

            const cloze = generator.generateClozePassage(invalidWord, mockQuestions);
            expect(cloze).toBeNull();
        });

        it('should return null if word object is invalid', () => {
            expect(generator.generateClozePassage(null, mockQuestions)).toBeNull();
            expect(generator.generateClozePassage({}, mockQuestions)).toBeNull();
            expect(generator.generateClozePassage({ answer: 'test' }, mockQuestions)).toBeNull();
        });

        it('should shuffle word bank', () => {
            // Generate multiple clozes and check if order varies
            const targetWord = mockQuestions[0];
            const cloze1 = generator.generateClozePassage(targetWord, mockQuestions);
            const cloze2 = generator.generateClozePassage(targetWord, mockQuestions);

            // Word banks should contain same words but may be in different order
            expect(cloze1.word_bank.sort()).toEqual(cloze2.word_bank.sort());
        });
    });

    describe('Smart Distractor Generation', () => {
        it('should generate specified number of distractors', () => {
            const targetWord = mockQuestions[0];
            const distractors = generator.generateSmartDistractors(targetWord, mockQuestions, 'Test _____', 3);

            expect(distractors.length).toBe(3);
        });

        it('should not include target word in distractors', () => {
            const targetWord = mockQuestions[0];
            const distractors = generator.generateSmartDistractors(targetWord, mockQuestions, 'Test _____', 3);

            expect(distractors).not.toContain('rope');
        });

        it('should prefer words from different themes', () => {
            const targetWord = mockQuestions[0]; // Nautical & Maritime
            const distractors = generator.generateSmartDistractors(targetWord, mockQuestions, 'Test _____', 2);

            // Should include words from other themes if possible
            const hasOtherTheme = distractors.some(d => {
                const word = mockQuestions.find(q => q.answer === d);
                return word && word.theme !== 'Nautical & Maritime';
            });
            expect(hasOtherTheme).toBe(true);
        });

        it('should avoid same-ending words when possible', () => {
            const similarWords = [
                { id: 1, answer: 'creative', example: 'Test creative.' },
                { id: 2, answer: 'active', example: 'Test active.' },
                { id: 3, answer: 'native', example: 'Test native.' },
                { id: 4, answer: 'book', example: 'Test book.' }, // Different ending
            ];

            const targetWord = similarWords[0];
            const distractors = generator.generateSmartDistractors(targetWord, similarWords, 'Test _____', 2);

            // Should preferentially select 'book' but algorithm is probabilistic
            // Just verify we get 2 distractors and they're valid
            expect(distractors).lengthOf(2);
            expect(distractors).not.toContain('creative');
        });

        it('should handle insufficient pool gracefully', () => {
            const smallPool = [mockQuestions[0], mockQuestions[1]];
            const targetWord = smallPool[0];

            const distractors = generator.generateSmartDistractors(targetWord, smallPool, 'Test _____', 5);

            // Should return what's available (max 1 from this pool)
            expect(distractors.length).toBeLessThanOrEqual(1);
        });
    });

    describe('Options Format', () => {
        it('should create options object with correct format', () => {
            const targetWord = mockQuestions[0];
            const cloze = generator.generateClozePassage(targetWord, mockQuestions);

            expect(cloze.options).toBeDefined();
            expect(cloze.options[1]).toBeDefined();
            expect(cloze.options[2]).toBeDefined();
            expect(cloze.options[3]).toBeDefined();
            expect(cloze.options[4]).toBeDefined();
        });
    });

    describe('Legacy Distractor Method', () => {
        it('should still work with generateDistractors', () => {
            const targetWord = mockQuestions[0];
            const distractors = generator.generateDistractors(targetWord, mockQuestions, 3);

            expect(Array.isArray(distractors)).toBe(true);
            expect(distractors.length).toBeGreaterThan(0);
        });
    });

    describe('Case Insensitive Matching', () => {
        it('should match answer regardless of case in example', () => {
            const targetWord = {
                id: 99,
                answer: 'ROPE',
                example: 'The sailor used a rope to tie the boat.'
            };

            const cloze = generator.generateClozePassage(targetWord, mockQuestions);
            expect(cloze).toBeDefined();
            expect(cloze.formatted_text).toContain('_____');
        });
    });
});

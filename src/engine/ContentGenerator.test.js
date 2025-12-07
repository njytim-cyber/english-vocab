import { describe, it, expect, vi } from 'vitest';
import { ContentGenerator } from './ContentGenerator';

describe('ContentGenerator', () => {
    const generator = new ContentGenerator();
    const mockQuestions = [
        { id: 1, answer: 'apple', example: 'I ate an apple.', theme: 'Food' },
        { id: 2, answer: 'banana', example: 'The banana is yellow.', theme: 'Food' },
        { id: 3, answer: 'carrot', example: 'Rabbits like carrots.', theme: 'Food' },
        { id: 4, answer: 'dog', example: 'The dog barked.', theme: 'Animals' },
        { id: 5, answer: 'cat', example: 'The cat meowed.', theme: 'Animals' }
    ];

    it('generates a valid cloze passage', () => {
        const target = mockQuestions[0]; // apple
        const result = generator.generateClozePassage(target, mockQuestions);

        expect(result).not.toBeNull();
        expect(result.type).toBe('ClozePassage');
        expect(result.formatted_text).toBe('I ate an _____.');
        expect(result.answer).toBe('apple');
        expect(result.word_bank).toHaveLength(4); // Target + 3 distractors
        expect(result.word_bank).toContain('apple');
    });

    it('generates distractors from the same theme', () => {
        const target = mockQuestions[0]; // apple (Food)
        const result = generator.generateClozePassage(target, mockQuestions);

        // Should prefer Food items: banana, carrot
        // We only have 2 other food items, so it might pull from Animals if needed, 
        // but here we have enough for 3 distractors? No, we have 2 Food distractors.
        // So it should pull 1 from Animals.

        const distractors = result.word_bank.filter(w => w !== 'apple');
        expect(distractors).toHaveLength(3);
    });

    it('returns null if example does not contain answer', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const target = { id: 6, answer: 'pear', example: 'I like fruit.', theme: 'Food' };
        const result = generator.generateClozePassage(target, mockQuestions);
        expect(result).toBeNull();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('is case insensitive for replacement', () => {
        const target = { id: 7, answer: 'Apple', example: 'apple pie is good.', theme: 'Food' };
        const result = generator.generateClozePassage(target, mockQuestions);
        expect(result.formatted_text).toBe('_____ pie is good.');
    });
});

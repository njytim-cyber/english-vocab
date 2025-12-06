import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from './AnalyticsService';

describe('AnalyticsService', () => {
    let service;

    beforeEach(() => {
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn()
        };
        service = new AnalyticsService();
    });

    it('logs answers correctly', () => {
        service.logAnswer(1, 1500, true, 'MCQ');
        expect(service.history).toHaveLength(1);
        expect(service.history[0]).toMatchObject({
            questionId: 1,
            timeTaken: 1500,
            isCorrect: true,
            type: 'MCQ'
        });
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('calculates average answer time', () => {
        service.logAnswer(1, 1000, true);
        service.logAnswer(2, 3000, true);
        service.logAnswer(3, 5000, false); // Should be ignored for "correct" avg? 
        // Implementation says: filter(h => h.isCorrect)

        const avg = service.getAverageAnswerTime();
        expect(avg).toBe(2000); // (1000 + 3000) / 2
    });

    it('calculates type performance', () => {
        service.logAnswer(1, 1000, true, 'ClozePassage');
        service.logAnswer(2, 1000, false, 'ClozePassage');
        service.logAnswer(3, 1000, true, 'MCQ');

        const clozePerf = service.getTypePerformance('ClozePassage');
        const mcqPerf = service.getTypePerformance('MCQ');

        expect(clozePerf).toBe(0.5);
        expect(mcqPerf).toBe(1.0);
    });

    it('calculates difficulty modifier based on recent accuracy', () => {
        // High accuracy -> 1.2
        for (let i = 0; i < 10; i++) {
            service.logAnswer(i, 1000, true);
        }
        expect(service.getDifficultyModifier()).toBe(1.2);

        // Low accuracy -> 0.8
        // Clear history for test simplicity or append enough fails
        service.history = [];
        for (let i = 0; i < 10; i++) {
            service.logAnswer(i, 1000, false);
        }
        expect(service.getDifficultyModifier()).toBe(0.8);
    });
});

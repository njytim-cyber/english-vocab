/**
 * Spaced Repetition System using a simplified Leitner Box model.
 * Box 1: Review every session (New/Hard)
 * Box 2: Review every 2nd session
 * Box 3: Review every 3rd session
 * Box 4: Review every 5th session
 * Box 5: Learned (Review rarely)
 */

const STORAGE_KEY = 'vocab_quest_progress';

export class SpacedRepetition {
    constructor() {
        this.progress = this.loadProgress();
    }

    loadProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    }

    /**
     * Get the current box for a question ID. Defaults to Box 1.
     * @param {number} questionId 
     * @returns {number} Box number (1-5)
     */
    getBox(questionId) {
        return this.progress[questionId]?.box || 1;
    }

    /**
     * Update progress for a question based on the answer.
     * @param {number} questionId 
     * @param {boolean} isCorrect 
     */
    updateProgress(questionId, isCorrect) {
        const currentBox = this.getBox(questionId);
        let nextBox = currentBox;

        if (isCorrect) {
            // Promote to next box, max 5
            nextBox = Math.min(currentBox + 1, 5);
        } else {
            // Demote to Box 1 on mistake
            nextBox = 1;
        }

        this.progress[questionId] = {
            box: nextBox,
            lastReviewed: Date.now()
        };

        this.saveProgress();
        return nextBox;
    }

    /**
     * Sort questions based on their box (lower box = higher priority).
     * @param {Array} questions 
     * @returns {Array} Sorted questions
     */
    prioritizeQuestions(questions) {
        return [...questions].sort((a, b) => {
            const boxA = this.getBox(a.question_number || a.id);
            const boxB = this.getBox(b.question_number || b.id);
            return boxA - boxB;
        });
    }

    reset() {
        this.progress = {};
        this.saveProgress();
    }
}

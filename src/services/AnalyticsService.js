const STORAGE_KEY = 'vocab_analytics';

export class AnalyticsService {
    constructor() {
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load analytics', e);
            return [];
        }
    }

    saveHistory() {
        try {
            // Limit history to last 1000 entries to prevent bloat
            if (this.history.length > 1000) {
                this.history = this.history.slice(-1000);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save analytics', e);
        }
    }

    /**
     * Log a user's answer attempt.
     * @param {string|number} questionId 
     * @param {number} timeTaken - Time in milliseconds
     * @param {boolean} isCorrect 
     * @param {string} type - 'MCQ', 'ClozePassage', etc.
     */
    logAnswer(questionId, timeTaken, isCorrect, type = 'MCQ') {
        this.history.push({
            timestamp: Date.now(),
            questionId,
            timeTaken,
            isCorrect,
            type
        });
        this.saveHistory();
    }

    /**
     * Get the average time taken to answer correctly.
     * @returns {number} Average time in ms, default 3000ms
     */
    getAverageAnswerTime() {
        const correctAnswers = this.history.filter(h => h.isCorrect);
        if (correctAnswers.length === 0) return 3000; // Default baseline

        const totalTime = correctAnswers.reduce((sum, h) => sum + h.timeTaken, 0);
        return Math.round(totalTime / correctAnswers.length);
    }

    /**
     * Get performance ratio for a specific question type.
     * @param {string} type 
     * @returns {number} 0.0 to 1.0 (Accuracy)
     */
    getTypePerformance(type) {
        const typeAnswers = this.history.filter(h => h.type === type);
        if (typeAnswers.length === 0) return 1.0; // Assume good if no data

        const correctCount = typeAnswers.filter(h => h.isCorrect).length;
        return correctCount / typeAnswers.length;
    }

    /**
     * Calculate a difficulty modifier (lambda) based on recent performance.
     * Lower lambda (< 1) means easier/slower, Higher (> 1) means harder/faster.
     * @returns {number} Lambda value (e.g., 0.8 to 1.2)
     */
    getDifficultyModifier() {
        // Simple model: 
        // If recent accuracy (last 20) is high (> 80%), increase difficulty.
        // If recent accuracy is low (< 50%), decrease difficulty.

        const recent = this.history.slice(-20);
        if (recent.length === 0) return 1.0;

        const correctCount = recent.filter(h => h.isCorrect).length;
        const accuracy = correctCount / recent.length;

        if (accuracy > 0.8) return 1.2;
        if (accuracy < 0.5) return 0.8;
        return 1.0;
    }
}

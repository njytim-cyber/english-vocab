/**
 * QuestionManager - Handles question pool, filtering, and selection
 * Extracted from QuizEngine for single responsibility
 */
import questions from '../data/questions.json';
import { EventService } from '../services/EventService';

export class QuestionManager {
    constructor(questionData = questions) {
        this.allQuestions = questionData;
        this.eventService = new EventService();
    }

    /**
     * Get all questions
     * @returns {Object[]}
     */
    getAll() {
        return this.allQuestions;
    }

    /**
     * Filter questions by theme and/or difficulty
     * @param {Object} filters
     * @param {string} [filters.theme]
     * @param {number|string} [filters.difficulty]
     * @returns {Object[]}
     */
    filter({ theme = null, difficulty = null } = {}) {
        let filtered = this.allQuestions;

        if (theme && theme !== 'All') {
            filtered = filtered.filter(q => q.theme === theme);
        }

        if (difficulty && difficulty !== 'All') {
            if (typeof difficulty === 'string' && difficulty.includes('-')) {
                const [min, max] = difficulty.split('-').map(Number);
                filtered = filtered.filter(q => q.difficulty >= min && q.difficulty <= max);
            } else {
                filtered = filtered.filter(q => q.difficulty === parseInt(difficulty));
            }
        }

        // Fallback if no matches
        if (filtered.length === 0) {
            console.warn('QuestionManager: No questions match filter, using all');
            return this.allQuestions;
        }

        return filtered;
    }

    /**
     * Get unique themes (respects active seasonal events)
     * @returns {string[]}
     */
    getThemes() {
        const activeEvent = this.eventService.getActiveEvent();
        const activeTheme = activeEvent ? activeEvent.theme : null;
        const seasonalThemes = this.eventService.events.map(e => e.theme);

        const themes = new Set(this.allQuestions.map(q => q.theme).filter(Boolean));

        const availableThemes = Array.from(themes).filter(theme => {
            if (seasonalThemes.includes(theme)) {
                return theme === activeTheme;
            }
            return true;
        });

        return ['All', ...availableThemes.sort()];
    }

    /**
     * Check if a word exists in the question pool
     * @param {string} word
     * @returns {boolean}
     */
    isValidWord(word) {
        return this.allQuestions.some(q => q.answer.toLowerCase() === word.toLowerCase());
    }

    /**
     * Get words for Word Ladder game (specific length, alphabetic only)
     * @param {number} length
     * @returns {string[]}
     */
    getWordPool(length = 4) {
        return Array.from(new Set(
            this.allQuestions
                .map(q => q.answer.toLowerCase())
                .filter(w => w.length === length && /^[a-z]+$/.test(w))
        ));
    }
}

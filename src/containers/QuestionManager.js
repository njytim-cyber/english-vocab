/**
 * QuestionManager - Handles question pool, filtering, and selection
 * Extracted from QuizEngine for single responsibility
 */
import questions from '../data/questions.json';
import clozePassages from '../data/cloze_sample.json';
import { EventService } from '../services/EventService';

export class QuestionManager {
    constructor(questionData = questions, clozeData = clozePassages) {
        this.allQuestions = questionData;
        this.clozePassages = clozeData;
        this.eventService = new EventService();
    }

    /**
     * Get all questions (MCQ only by default)
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
            const themes = Array.isArray(theme) ? theme : theme.split(',');
            if (themes.length > 0 && !themes.includes('All')) {
                filtered = filtered.filter(q => themes.includes(q.theme));
            }
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
        // Add cloze themes
        this.clozePassages.forEach(p => {
            if (p.theme) themes.add(p.theme);
        });

        const availableThemes = Array.from(themes).filter(theme => {
            if (seasonalThemes.includes(theme)) {
                return theme === activeTheme;
            }
            return true;
        });

        return ['All', ...availableThemes.sort()];
    }

    /**
     * Get flattened cloze questions based on filters
     * @param {Object} filters
     * @returns {Object[]} Array of individual blank questions
     */
    getClozeQuestions({ theme = null, difficulty = null } = {}) {
        let filteredPassages = this.clozePassages;

        if (theme && theme !== 'All') {
            filteredPassages = filteredPassages.filter(p => p.theme === theme);
        }

        if (difficulty && difficulty !== 'All') {
            const diff = parseInt(difficulty);
            filteredPassages = filteredPassages.filter(p => p.difficulty === diff || (Math.abs(p.difficulty - diff) <= 1));
        }

        return this._flattenClozePassages(filteredPassages);
    }

    _flattenClozePassages(passages) {
        let flattened = [];
        passages.forEach(passage => {
            passage.paragraphs.forEach((para, pIndex) => {
                para.blanks.forEach((blank, bIndex) => {
                    // Create a question object for each blank
                    flattened.push({
                        id: `cloze_${passage.id}_${blank.id}`,
                        type: 'vocab-cloze',
                        difficulty: passage.difficulty,
                        theme: passage.theme,
                        question: this._generateClozeQuestionText(para.text, blank.id),
                        answer: blank.answer,
                        options: blank.options,
                        context: passage.title, // Extra context if needed
                        passageId: passage.id
                    });
                });
            });
        });
        return flattened;
    }

    _generateClozeQuestionText(text, blankId) {
        // Replace the target blank with "_____" and others with "(...)" or kept as is?
        // Simple approach: Replace target blank with [?] and others with [...]
        // But the input text has markers like __1__, __2__
        // We want to show the full text with the target blank highlighted/empty.

        // Regex to replace __X__
        return text.replace(/__(\d+)__/g, (match, id) => {
            if (parseInt(id) === blankId) return "__________";
            return `(${id})`;
        });
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

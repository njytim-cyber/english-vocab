import questions from '../data/questions.json';
import { SpacedRepetition } from './SpacedRepetition';
import { ContentGenerator } from './ContentGenerator';
import { AnalyticsService } from '../services/AnalyticsService';
import { EventService } from '../services/EventService';

/**
 * @typedef {Object} QuizState
 * @property {number} currentQuestionIndex
 * @property {number} score
 * @property {number} streak
 * @property {boolean} isFinished
 * @property {number} xp
 */

export class QuizEngine {
    constructor(questionData = questions) {
        this.allQuestions = questionData; // Store all questions
        this.sr = new SpacedRepetition();
        this.contentGenerator = new ContentGenerator();
        this.analytics = new AnalyticsService();
        this.eventService = new EventService();

        // Default to all questions sorted by priority
        this.questions = this.sr.prioritizeQuestions(this.allQuestions);
        this.sessionHistory = []; // Track current session results

        this.currentQuestionStartTime = 0;
        this.scoringMode = 'standard'; // 'standard' | 'time-decay'

        this.state = {
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            isFinished: false,
            xp: 0
        };
    }

    setScoringMode(mode) {
        this.scoringMode = mode;
    }

    /**
     * Start a new game with optional filters
     * @param {string} theme - Filter by theme (optional)
     * @param {number} difficulty - Filter by difficulty (optional)
     */
    startNewGame(theme = null, difficulty = null) {
        console.log('QuizEngine: startNewGame', theme, difficulty);
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

        // If no questions match, fallback to all (or handle empty state)
        if (filtered.length === 0) {
            console.warn("No questions match filter, using all questions");
            filtered = this.allQuestions;
        }

        console.log('QuizEngine: filtered count', filtered.length);

        // Prioritize and LIMIT to 10 questions
        let selectedQuestions = this.sr.prioritizeQuestions(filtered).slice(0, 10);

        // Adaptive Cloze Generation
        // Check performance on Cloze passages
        const clozePerf = this.analytics.getTypePerformance('ClozePassage');
        // If performance is low (< 0.7), increase probability (0.9). Else base (0.4).
        const clozeProbability = clozePerf < 0.7 ? 0.9 : 0.4;

        console.log(`QuizEngine: Cloze Performance ${clozePerf.toFixed(2)}, Probability ${clozeProbability}`);

        // Convert eligible questions to Cloze Passages
        this.questions = selectedQuestions.map(q => {
            const box = this.sr.getBox(q.question_number || q.id);
            // Mid-range mastery (2-5) eligible for Cloze
            if (box >= 2 && box <= 5) {
                // Apply probability
                if (Math.random() < clozeProbability) {
                    const cloze = this.contentGenerator.generateClozePassage(q, this.allQuestions);
                    if (cloze) return cloze;
                }
            }
            return q;
        });

        console.log('QuizEngine: prioritized count', this.questions.length);

        this.sessionHistory = [];
        this.currentQuestionStartTime = Date.now();

        this.state = {
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            isFinished: false,
            xp: 0
        };
        console.log('QuizEngine: state initialized');
    }

    /**
     * Start a retry game with specific questions
     * @param {Array} questionsToRetry 
     */
    startRetryGame(questionsToRetry) {
        this.questions = questionsToRetry;
        this.sessionHistory = [];
        this.currentQuestionStartTime = Date.now();
        this.state = {
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            isFinished: false,
            xp: 0
        };
    }

    /**
     * Submit an answer for the current question.
     * @param {string} answer 
     * @returns {boolean} isCorrect
     */
    answer(answer) {
        if (this.state.isFinished) return false;

        const currentQuestion = this.questions[this.state.currentQuestionIndex];
        // Check if answer matches the text string directly
        const isCorrect = currentQuestion.answer === answer;

        const timeTaken = Date.now() - this.currentQuestionStartTime;
        const type = currentQuestion.type || 'MCQ';

        // Log to Analytics
        this.analytics.logAnswer(
            currentQuestion.question_number || currentQuestion.id,
            timeTaken,
            isCorrect,
            type
        );

        // Track history
        this.sessionHistory.push({
            question: currentQuestion,
            userAnswer: answer,
            isCorrect: isCorrect,
            timeTaken: timeTaken
        });

        if (isCorrect) {
            let points = 10;

            if (this.scoringMode === 'time-decay') {
                const timeLimit = 10000; // 10 seconds baseline
                // Formula: Base * (1 + (Limit - Taken)/Limit)
                // Max 2x multiplier (instant), Min 1x (at limit or over)
                // Actually user formula: 1 + (Limit - Taken)/Limit
                // If Taken > Limit, term is negative, so < 1x.
                // Let's clamp timeTaken to Limit for the bonus calculation to avoid punishment below base?
                // "heavily rewarding speed" -> implies bonus.
                const effectiveTime = Math.min(timeTaken, timeLimit);
                const bonusFactor = (timeLimit - effectiveTime) / timeLimit;
                // Multiplier = 1 + bonusFactor (Range 1.0 to 2.0)
                points = Math.round(10 * (1 + Math.max(0, bonusFactor)));
            }

            this.state.score += points;
            this.state.streak += 1;
            this.state.xp += points + (this.state.streak * 2); // XP scales with points too? Or keep separate?
        } else {
            this.state.streak = 0;
        }

        // Update Spaced Repetition Progress
        // Use question_number if available, fallback to id
        const qId = currentQuestion.question_number || currentQuestion.id;
        if (qId) {
            this.sr.updateProgress(qId, isCorrect);
        }

        this.state.currentQuestionIndex++;
        this.currentQuestionStartTime = Date.now(); // Reset timer for next question

        if (this.state.currentQuestionIndex >= this.questions.length) {
            this.state.isFinished = true;
        }

        return isCorrect;
    }

    /**
     * Get the current state of the quiz.
     * @returns {QuizState}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get the session history
     */
    getSessionHistory() {
        return this.sessionHistory;
    }

    /**
     * Get unique themes from all questions.
     * Filters out seasonal themes if the event is not active.
     * @returns {string[]}
     */
    getThemes() {
        const activeEvent = this.eventService.getActiveEvent();
        const activeTheme = activeEvent ? activeEvent.theme : null;

        // List of all seasonal themes (could be fetched from EventService or hardcoded)
        const seasonalThemes = this.eventService.events.map(e => e.theme);

        const themes = new Set(this.allQuestions.map(q => q.theme).filter(Boolean));

        // Filter: Keep theme if it's NOT seasonal OR if it matches the active event theme
        const availableThemes = Array.from(themes).filter(theme => {
            if (seasonalThemes.includes(theme)) {
                return theme === activeTheme;
            }
            return true;
        });

        const sortedThemes = ['All', ...availableThemes.sort()];
        console.log('QuizEngine: Loaded Themes:', sortedThemes);
        return sortedThemes;
    }

    /**
     * Calculate mastery level (0-5) for a specific theme.
     */
    getThemeMastery(theme) {
        if (theme === 'All') return 0; // Or average of all?

        const themeQuestions = this.allQuestions.filter(q => q.theme === theme);
        if (themeQuestions.length === 0) return 0;

        const totalBox = themeQuestions.reduce((sum, q) => {
            const id = q.question_number || q.id;
            return sum + this.sr.getBox(id);
        }, 0);

        return Math.round(totalBox / themeQuestions.length);
    }

    /**
     * Get the current question object.
     * Returns a normalized structure for the view.
     * @returns {Object|null}
     */
    getCurrentQuestion() {
        if (this.state.isFinished) return null;
        return this.questions[this.state.currentQuestionIndex];
    }

    /**
     * Get a list of question objects that need reinforcement.
     * @param {number} count 
     * @returns {Object[]} Array of question objects
     */
    getReinforcementQuestions(count = 10) {
        // Group questions by box level
        const byBox = {};
        for (const q of this.allQuestions) {
            const box = this.sr.getBox(q.question_number || q.id);
            if (!byBox[box]) byBox[box] = [];
            byBox[box].push(q);
        }

        const selected = [];
        const seenAnswers = new Set();

        // Iterate through boxes 0 to 5
        for (let box = 0; box <= 5; box++) {
            if (selected.length >= count) break;
            if (!byBox[box]) continue;

            // Shuffle questions in this box
            const shuffled = [...byBox[box]].sort(() => Math.random() - 0.5);

            for (const q of shuffled) {
                if (selected.length >= count) break;
                if (!seenAnswers.has(q.answer)) {
                    selected.push(q);
                    seenAnswers.add(q.answer);
                }
            }
        }

        // If we still need more (shouldn't happen if we have enough questions), fill from any
        if (selected.length < count) {
            const remaining = this.allQuestions
                .filter(q => !seenAnswers.has(q.answer))
                .sort(() => Math.random() - 0.5);

            for (const q of remaining) {
                if (selected.length >= count) break;
                selected.push(q);
                seenAnswers.add(q.answer);
            }
        }

        return selected;
    }

    /**
     * Get a list of words that need reinforcement (lowest mastery).
     * @param {number} count 
     * @returns {string[]} Array of words (answers)
     */
    getReinforcementWords(count = 10) {
        return this.getReinforcementQuestions(count).map(q => q.answer);
    }

    /**
     * Generate a Word Ladder challenge.
     * Finds a start and end word separated by a valid chain of `steps`.
     * @param {number} wordLength Length of words to use (default 4)
     * @param {number} minSteps Minimum steps required (default 3)
     * @returns {Object|null} { start: string, end: string, path: string[] } or null if failed
     */
    getWordLadderChallenge(wordLength = 4, minSteps = 3) {
        // 1. Filter words of given length
        const pool = Array.from(new Set(
            this.allQuestions
                .map(q => q.answer.toLowerCase())
                .filter(w => w.length === wordLength && /^[a-z]+$/.test(w))
        ));

        if (pool.length < 10) return null; // Not enough words

        // 2. Build Adjacency Graph (Lazy or Pre-compute? Pool is small enough for on-the-fly)
        const isAdjacent = (w1, w2) => {
            let diff = 0;
            for (let i = 0; i < w1.length; i++) {
                if (w1[i] !== w2[i]) diff++;
                if (diff > 1) return false;
            }
            return diff === 1;
        };

        // 3. Try to find a path
        // We'll try X random start words
        for (let i = 0; i < 20; i++) {
            const start = pool[Math.floor(Math.random() * pool.length)];
            const queue = [[start]];
            const visited = new Set([start]);

            // BFS to find a path of at least minSteps
            // We limit depth to avoid infinite loops, though visited handles that
            while (queue.length > 0) {
                const path = queue.shift();
                const current = path[path.length - 1];

                if (path.length - 1 >= minSteps) {
                    // Found a valid path!
                    return {
                        start: start,
                        end: current,
                        path: path // Hidden solution
                    };
                }

                // Find neighbors
                const neighbors = pool.filter(w => !visited.has(w) && isAdjacent(current, w));
                for (const n of neighbors) {
                    visited.add(n);
                    queue.push([...path, n]);
                }
            }
        }

        return null; // Failed to find a ladder
    }

    /**
     * Check if a word exists in the dictionary (pool of answers).
     * @param {string} word 
     * @returns {boolean}
     */
    isValidWord(word) {
        return this.allQuestions.some(q => q.answer.toLowerCase() === word.toLowerCase());
    }

    /**
     * Get list of words that need revision (Box 1).
     * @param {number} threshold - Not used in Leitner model, we use Box 1.
     * @returns {Object[]} List of question objects
     */
    getRevisionList(threshold = 1.8) {
        // In Leitner, we consider Box 1 (and maybe 2) as needing revision.
        // For now, let's return all questions in Box 1.
        return this.allQuestions.filter(q => {
            const id = q.question_number || q.id;
            return this.sr.getBox(id) === 1;
        });
    }

    /**
     * Process an answer for a revision question.
     * @param {string|number} wordId 
     * @param {boolean} isCorrect 
     */
    processRevisionAnswer(wordId, isCorrect) {
        if (isCorrect) {
            // Boost to Box 4 (S_revision_pass)
            this.sr.setBox(wordId, 4);
            return true;
        } else {
            // Reset to Box 1
            this.sr.updateProgress(wordId, false);
            return false;
        }
    }
}

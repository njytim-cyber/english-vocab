/**
 * QuizEngine - Game orchestrator
 * Delegates to QuestionManager, SessionManager, SpacedRepetition, ContentGenerator
 * 
 * Refactored to use composition for maintainability
 */
import { QuestionManager } from '../containers/QuestionManager';
import { SessionManager } from '../containers/SessionManager';
import { SpacedRepetition } from './SpacedRepetition';
import { ContentGenerator } from './ContentGenerator';
import { AnalyticsService } from '../services/AnalyticsService';

export class QuizEngine {
    constructor(questionData = undefined) {
        this.questionManager = new QuestionManager(questionData);
        this.sessionManager = new SessionManager();
        this.sr = new SpacedRepetition();
        this.contentGenerator = new ContentGenerator();
        this.analytics = new AnalyticsService();

        // Expose allQuestions for backward compatibility
        this.allQuestions = this.questionManager.getAll();
        // Default questions sorted by priority
        this.questions = this.sr.prioritizeQuestions(this.allQuestions);

        // Initialize session with default questions for backward compatibility
        this.sessionManager.start(this.questions);
        this.sessionHistory = [];

        // Sync state
        this.state = this.sessionManager.getState();
    }

    setScoringMode(mode) {
        this.sessionManager.setScoringMode(mode);
    }

    /**
     * Start a new game with optional filters
     * @param {string} theme
     * @param {number} difficulty
     */
    startNewGame(theme = null, difficulty = null) {
        console.log('QuizEngine: startNewGame', theme, difficulty);

        // Use QuestionManager for filtering
        const filtered = this.questionManager.filter({ theme, difficulty });
        console.log('QuizEngine: filtered count', filtered.length);

        // Prioritize and limit to 10
        let selectedQuestions = this.sr.prioritizeQuestions(filtered).slice(0, 10);

        // Adaptive Cloze Generation
        const clozePerf = this.analytics.getTypePerformance('ClozePassage');
        const clozeProbability = clozePerf < 0.7 ? 0.9 : 0.4;
        console.log(`QuizEngine: Cloze Performance ${clozePerf.toFixed(2)}, Probability ${clozeProbability}`);

        this.questions = selectedQuestions.map(q => {
            const box = this.sr.getBox(q.question_number || q.id);
            if (box >= 2 && box <= 5) {
                if (Math.random() < clozeProbability) {
                    const cloze = this.contentGenerator.generateClozePassage(q, this.allQuestions);
                    if (cloze) return cloze;
                }
            }
            return q;
        });

        console.log('QuizEngine: prioritized count', this.questions.length);

        // Use SessionManager for state
        this.sessionManager.start(this.questions);
        this.sessionHistory = [];

        // Sync state for backward compatibility
        this.state = this.sessionManager.getState();
        console.log('QuizEngine: state initialized');
    }

    /**
     * Start a retry game with specific questions
     * @param {Array} questionsToRetry
     */
    startRetryGame(questionsToRetry) {
        this.questions = questionsToRetry;
        this.sessionManager.start(questionsToRetry);
        this.sessionHistory = [];
        this.state = this.sessionManager.getState();
    }

    /**
     * Submit an answer
     * @param {string} answer
     * @returns {boolean} isCorrect
     */
    answer(answer) {
        if (this.state.isFinished) return false;

        const currentQuestion = this.sessionManager.getCurrentQuestion();
        const { isCorrect, points } = this.sessionManager.submitAnswer(answer);
        const timeTaken = this.sessionManager.getHistory().slice(-1)[0]?.timeTaken || 0;

        // Log to Analytics
        this.analytics.logAnswer(
            currentQuestion.question_number || currentQuestion.id,
            timeTaken,
            isCorrect,
            currentQuestion.type || 'MCQ'
        );

        // Track history for backward compatibility
        this.sessionHistory = this.sessionManager.getHistory();

        // Update Spaced Repetition
        const qId = currentQuestion.question_number || currentQuestion.id;
        if (qId) {
            this.sr.updateProgress(qId, isCorrect);
        }

        // Sync state
        this.state = this.sessionManager.getState();

        return isCorrect;
    }

    getState() {
        return this.sessionManager.getState();
    }

    getSessionHistory() {
        return this.sessionManager.getHistory();
    }

    getThemes() {
        const themes = this.questionManager.getThemes();
        console.log('QuizEngine: Loaded Themes:', themes);
        return themes;
    }

    getThemeMastery(theme) {
        if (theme === 'All') return 0;

        const themeQuestions = this.questionManager.filter({ theme });
        if (themeQuestions.length === 0) return 0;

        const totalBox = themeQuestions.reduce((sum, q) => {
            const id = q.question_number || q.id;
            return sum + this.sr.getBox(id);
        }, 0);

        return Math.round(totalBox / themeQuestions.length);
    }

    getCurrentQuestion() {
        return this.sessionManager.getCurrentQuestion();
    }

    /**
     * Get reinforcement questions (grouped by box, deduplicated)
     * @param {number} count
     * @returns {Object[]}
     */
    getReinforcementQuestions(count = 10) {
        const byBox = {};
        for (const q of this.allQuestions) {
            const box = this.sr.getBox(q.question_number || q.id);
            if (!byBox[box]) byBox[box] = [];
            byBox[box].push(q);
        }

        const selected = [];
        const seenAnswers = new Set();

        for (let box = 0; box <= 5; box++) {
            if (selected.length >= count) break;
            if (!byBox[box]) continue;

            const shuffled = [...byBox[box]].sort(() => Math.random() - 0.5);
            for (const q of shuffled) {
                if (selected.length >= count) break;
                if (!seenAnswers.has(q.answer)) {
                    selected.push(q);
                    seenAnswers.add(q.answer);
                }
            }
        }

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

    getReinforcementWords(count = 10) {
        return this.getReinforcementQuestions(count).map(q => q.answer);
    }

    /**
     * Word Ladder challenge generation
     */
    getWordLadderChallenge(wordLength = 4, minSteps = 3) {
        const pool = this.questionManager.getWordPool(wordLength);
        if (pool.length < 10) return null;

        const isAdjacent = (w1, w2) => {
            let diff = 0;
            for (let i = 0; i < w1.length; i++) {
                if (w1[i] !== w2[i]) diff++;
                if (diff > 1) return false;
            }
            return diff === 1;
        };

        for (let i = 0; i < 20; i++) {
            const start = pool[Math.floor(Math.random() * pool.length)];
            const queue = [[start]];
            const visited = new Set([start]);

            while (queue.length > 0) {
                const path = queue.shift();
                const current = path[path.length - 1];

                if (path.length - 1 >= minSteps) {
                    return { start, end: current, path };
                }

                const neighbors = pool.filter(w => !visited.has(w) && isAdjacent(current, w));
                for (const n of neighbors) {
                    visited.add(n);
                    queue.push([...path, n]);
                }
            }
        }

        return null;
    }

    isValidWord(word) {
        return this.questionManager.isValidWord(word);
    }

    getRevisionList(_threshold = 1.8) {
        return this.allQuestions.filter(q => {
            const id = q.question_number || q.id;
            return this.sr.getBox(id) === 1;
        });
    }

    processRevisionAnswer(wordId, isCorrect) {
        if (isCorrect) {
            this.sr.setBox(wordId, 4);
            return true;
        } else {
            this.sr.updateProgress(wordId, false);
            return false;
        }
    }
}

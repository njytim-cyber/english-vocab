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
import balance from '../data/balance.json';

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
        this.questionHistory = []; // NEW: Track question history for progress tracker

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
        // Use QuestionManager for filtering
        const filtered = this.questionManager.filter({ theme, difficulty });

        // Prioritize and limit (using balance.json)
        const limit = balance.gameSettings.questionsPerRound;
        let selectedQuestions = this.sr.prioritizeQuestions(filtered).slice(0, limit);

        // Adaptive Cloze Generation (using balance.json)
        const clozePerf = this.analytics.getTypePerformance('ClozePassage');
        const { performanceThreshold, probabilityHigh, probabilityLow, minBox, maxBox } = balance.clozeLogic;

        const clozeProbability = clozePerf < performanceThreshold ? probabilityHigh : probabilityLow;

        this.questions = selectedQuestions.map(q => {
            const box = this.sr.getBox(q.question_number || q.id);
            // Only convert to cloze if reasonably familiar
            if (box >= minBox && box <= maxBox) {
                if (Math.random() < clozeProbability) {
                    const cloze = this.contentGenerator.generateClozePassage(q, this.allQuestions);
                    if (cloze) return cloze;
                }
            }
            return q;
        });

        // Use SessionManager for state
        this.sessionManager.start(this.questions);
        this.sessionHistory = [];

        // Sync state for backward compatibility
        this.state = this.sessionManager.getState();
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
        const { isCorrect } = this.sessionManager.submitAnswer(answer);
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

        // NEW: Record question history for progress tracker
        this.questionHistory.push({
            questionIndex: this.state.currentQuestionIndex - 1, // Previous index (already incremented)
            question: currentQuestion,
            selectedAnswer: answer,
            correctAnswer: currentQuestion.answer,
            isCorrect
        });

        // Update Spaced Repetition
        const qId = currentQuestion.question_number || currentQuestion.id;
        if (qId) {
            this.sr.updateProgress(qId, isCorrect);
        }

        // Sync state
        this.state = this.sessionManager.getState();

        return isCorrect;
    }

    getQuestionHistory() {
        return this.questionHistory;
    }

    getState() {
        return this.sessionManager.getState();
    }

    getSessionHistory() {
        return this.sessionManager.getHistory();
    }

    getThemes() {
        return this.questionManager.getThemes();
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
        const selected = [];
        const seenAnswers = new Set();
        const questionPool = [...this.allQuestions];

        // Strategy: Iterate boxes 0..5, finding candidates
        for (let box = 0; box <= 5; box++) {
            if (selected.length >= count) break;

            const candidates = questionPool.filter(q => {
                const qBox = this.sr.getBox(q.question_number || q.id);
                return qBox === box && !seenAnswers.has(q.answer);
            });

            // Shuffle candidates for this box
            candidates.sort(() => Math.random() - 0.5);

            for (const q of candidates) {
                if (selected.length >= count) break;
                selected.push(q);
                seenAnswers.add(q.answer);
            }
        }

        // Fill remaining with random if needed
        if (selected.length < count) {
            const remaining = questionPool
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

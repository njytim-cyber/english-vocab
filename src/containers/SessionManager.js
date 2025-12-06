/**
 * SessionManager - Handles quiz session state, scoring, and progression
 * Extracted from QuizEngine for single responsibility
 */

/**
 * @typedef {Object} SessionState
 * @property {number} currentQuestionIndex
 * @property {number} score
 * @property {number} streak
 * @property {boolean} isFinished
 * @property {number} xp
 */

export class SessionManager {
    constructor() {
        this.questions = [];
        this.history = [];
        this.currentQuestionStartTime = 0;
        this.scoringMode = 'standard'; // 'standard' | 'time-decay'

        /** @type {SessionState} */
        this.state = {
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            isFinished: false,
            xp: 0
        };
    }

    /**
     * Start a new session with given questions
     * @param {Object[]} questions
     */
    start(questions) {
        this.questions = questions;
        this.history = [];
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
     * Set scoring mode
     * @param {'standard'|'time-decay'} mode
     */
    setScoringMode(mode) {
        this.scoringMode = mode;
    }

    /**
     * Get current question
     * @returns {Object|null}
     */
    getCurrentQuestion() {
        if (this.state.isFinished) return null;
        return this.questions[this.state.currentQuestionIndex];
    }

    /**
     * Submit an answer
     * @param {string} answer
     * @returns {{isCorrect: boolean, points: number}}
     */
    submitAnswer(answer) {
        if (this.state.isFinished) return { isCorrect: false, points: 0 };

        const currentQuestion = this.getCurrentQuestion();
        const isCorrect = currentQuestion.answer === answer;
        const timeTaken = Date.now() - this.currentQuestionStartTime;

        // Track history
        this.history.push({
            question: currentQuestion,
            userAnswer: answer,
            isCorrect,
            timeTaken
        });

        let points = 0;
        if (isCorrect) {
            points = 10;

            if (this.scoringMode === 'time-decay') {
                const timeLimit = 10000;
                const effectiveTime = Math.min(timeTaken, timeLimit);
                const bonusFactor = (timeLimit - effectiveTime) / timeLimit;
                points = Math.round(10 * (1 + Math.max(0, bonusFactor)));
            }

            this.state.score += points;
            this.state.streak += 1;
            this.state.xp += points + (this.state.streak * 2);
        } else {
            this.state.streak = 0;
        }

        // Advance
        this.state.currentQuestionIndex++;
        this.currentQuestionStartTime = Date.now();

        if (this.state.currentQuestionIndex >= this.questions.length) {
            this.state.isFinished = true;
        }

        return { isCorrect, points };
    }

    /**
     * Get current state
     * @returns {SessionState}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get session history
     * @returns {Object[]}
     */
    getHistory() {
        return this.history;
    }
}

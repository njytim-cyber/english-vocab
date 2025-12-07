import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizEngine } from './QuizEngine';

describe('QuizEngine', () => {
    let engine;
    const mockQuestions = [
        { question_number: 1, answer: 'rope', theme: 'Nautical & Maritime', difficulty: 1, question: 'Test 1', options: { 1: 'rope', 2: 'chain', 3: 'cable', 4: 'wire' } },
        { question_number: 2, answer: 'boat', theme: 'Nautical & Maritime', difficulty: 1, question: 'Test 2', options: { 1: 'boat', 2: 'ship', 3: 'dinghy', 4: 'raft' } },
        { question_number: 3, answer: 'ocean', theme: 'Science', difficulty: 2, question: 'Test 3', options: { 1: 'ocean', 2: 'lake', 3: 'sea', 4: 'pond' } },
        { question_number: 4, answer: 'coast', theme: 'Science', difficulty: 3, question: 'Test 4', options: { 1: 'coast', 2: 'shore', 3: 'beach', 4: 'bank' } },
    ];

    beforeEach(() => {
        localStorage.clear();
        engine = new QuizEngine(mockQuestions);
    });

    describe('Game Initialization', () => {
        it('should initialize with default state', () => {
            expect(engine.getState()).toBeDefined();
            expect(engine.getState().currentQuestionIndex).toBe(0);
            expect(engine.getState().score).toBe(0);
        });

        it('should start new game with theme filter', () => {
            engine.startNewGame('Nautical & Maritime');
            const questions = engine.sessionManager.questions;

            expect(questions.length).toBeGreaterThan(0);
            questions.forEach(q => {
                expect(q.theme).toBe('Nautical & Maritime');
            });
        });

        it('should start new game with difficulty filter', () => {
            engine.startNewGame(null, 1);
            const questions = engine.sessionManager.questions;

            expect(questions.length).toBeGreaterThan(0);
            questions.forEach(q => {
                expect(q.difficulty).toBe(1);
            });
        });

        it('should start new game with both theme and difficulty filters', () => {
            engine.startNewGame('Science', 2);
            const questions = engine.sessionManager.questions;

            expect(questions.length).toBeGreaterThan(0);
            questions.forEach(q => {
                expect(q.theme).toBe('Science');
                expect(q.difficulty).toBe(2);
            });
        });
    });

    describe('Answer Submission', () => {
        beforeEach(() => {
            engine.startNewGame();
        });

        it('should return true for correct answer', () => {
            const currentQuestion = engine.getCurrentQuestion();
            const correctAnswer = currentQuestion.answer;

            const isCorrect = engine.answer(correctAnswer);
            expect(isCorrect).toBe(true);
        });

        it('should return false for incorrect answer', () => {
            const currentQuestion = engine.getCurrentQuestion();
            const wrongAnswer = 'definitely_wrong_answer';

            const isCorrect = engine.answer(wrongAnswer);
            expect(isCorrect).toBe(false);
        });

        it('should increment score on correct answer', () => {
            const initialScore = engine.getState().score;
            const currentQuestion = engine.getCurrentQuestion();

            engine.answer(currentQuestion.answer);
            expect(engine.getState().score).toBeGreaterThan(initialScore);
        });

        it('should not increment score on incorrect answer', () => {
            const initialScore = engine.getState().score;

            engine.answer('wrong_answer');
            expect(engine.getState().score).toBe(initialScore);
        });

        it('should advance to next question after answering', () => {
            const initialQuestionIndex = engine.getState().currentQuestionIndex;
            const currentQuestion = engine.getCurrentQuestion();

            engine.answer(currentQuestion.answer);
            expect(engine.getState().currentQuestionIndex).toBe(initialQuestionIndex + 1);
        });
    });

    describe('Spaced Repetition Integration', () => {
        beforeEach(() => {
            engine.startNewGame();
        });

        it('should update box to 2 on first correct answer', () => {
            const currentQuestion = engine.getCurrentQuestion();
            const questionId = currentQuestion.question_number;

            engine.answer(currentQuestion.answer);
            expect(engine.sr.getBox(questionId)).toBe(2);
        });

        it('should demote to box 1 on incorrect answer', () => {
            const currentQuestion = engine.getCurrentQuestion();
            const questionId = currentQuestion.question_number;

            engine.answer(currentQuestion.answer);
            expect(engine.sr.getBox(questionId)).toBe(2);

            engine.startRetryGame([currentQuestion]);
            engine.answer('wrong_answer');
            expect(engine.sr.getBox(questionId)).toBe(1);
        });
    });

    describe('Session State Management', () => {
        it('should track question history', () => {
            engine.startNewGame();
            const q1 = engine.getCurrentQuestion();
            engine.answer(q1.answer);

            const q2 = engine.getCurrentQuestion();
            engine.answer('wrong_answer');

            const history = engine.getQuestionHistory();
            expect(history.length).toBe(2);
            expect(history[0].isCorrect).toBe(true);
            expect(history[1].isCorrect).toBe(false);
        });

        it('should return session history', () => {
            engine.startNewGame();
            const q1 = engine.getCurrentQuestion();
            engine.answer(q1.answer);

            const sessionHistory = engine.getSessionHistory();
            expect(sessionHistory).toBeDefined();
            expect(sessionHistory.length).toBeGreaterThan(0);
        });
    });

    describe('Theme Management', () => {
        it('should return all unique themes', () => {
            const themes = engine.getThemes();
            expect(themes).toContain('Nautical & Maritime');
            expect(themes).toContain('Science');
        });

        it('should calculate theme mastery', () => {
            engine.startNewGame('Science');
            while (engine.getState().currentQuestionIndex < 2 && engine.getCurrentQuestion()) {
                const q = engine.getCurrentQuestion();
                engine.answer(q.answer);
            }

            const mastery = engine.getThemeMastery('Science');
            expect(mastery).toBeGreaterThan(0);
        });
    });

    describe('Reinforcement Questions', () => {
        it('should generate reinforcement questions', () => {
            engine.startNewGame();
            for (let i = 0; i < 3; i++) {
                const q = engine.getCurrentQuestion();
                engine.answer(q.answer);
            }

            const reinforcement = engine.getReinforcementQuestions(5);
            expect(Array.isArray(reinforcement)).toBe(true);
        });

        it('should prioritize lower box questions for reinforcement', () => {
            engine.startNewGame();
            const q = engine.getCurrentQuestion();
            const qId = q.question_number;

            engine.sr.setBox(qId, 1);

            const reinforcement = engine.getReinforcementQuestions(10);
            const hasLowBoxQuestion = reinforcement.some(q => engine.sr.getBox(q.question_number) === 1);
            expect(hasLowBoxQuestion).toBe(true);
        });
    });

    describe('Retry Game', () => {
        it('should start retry game with specific questions', () => {
            const questionsToRetry = [mockQuestions[0], mockQuestions[1]];
            engine.startRetryGame(questionsToRetry);

            const state = engine.getState();
            expect(state.currentQuestionIndex).toBe(0);
            expect(engine.sessionManager.questions.length).toBe(2);
        });
    });

    describe('Scoring Modes', () => {
        it('should switch to time-decay scoring mode', () => {
            engine.setScoringMode('time-decay');
            engine.startNewGame();

            const q = engine.getCurrentQuestion();
            engine.answer(q.answer);

            const state = engine.getState();
            expect(state).toBeDefined();
        });
    });
});

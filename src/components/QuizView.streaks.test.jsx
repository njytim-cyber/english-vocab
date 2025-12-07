import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import QuizView from './QuizView';
import balance from '../data/balance.json';

// Mock dependencies
vi.mock('../utils/effects', () => ({
    triggerConfetti: vi.fn()
}));

vi.mock('../utils/rewardCalculator', () => ({
    calculateQuizReward: vi.fn(() => 5)
}));

describe('QuizView - Streak Visual Feedback', () => {
    const mockEngine = {
        getCurrentQuestion: vi.fn(() => ({
            id: '1',
            question: 'Test question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
            difficulty: 5,
            type: 'MCQ'
        })),
        getState: vi.fn(), // Will be mocked in each test
        answer: vi.fn(() => true),
        questions: [{ id: '1' }]
    };

    const mockEconomy = {
        addCoins: vi.fn(),
        achievements: {
            updateStats: vi.fn()
        }
    };

    const mockOnFinish = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset getState to return default state
        mockEngine.getState.mockReturnValue({
            currentQuestionIndex: 0,
            score: 50,
            streak: 0,
            isFinished: false
        });
    });

    describe('Streak Tier Calculation', () => {
        it('should show no badge when streak is 0-2', () => {
            mockEngine.getState.mockImplementation(() => ({ streak: 2, score: 50, isFinished: false, currentQuestionIndex: 0 }));
            const { container } = render(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            const badge = screen.queryByText(/🔥/);
            expect(badge?.style.visibility).toBe('hidden');
        });

        it('should show orange fire badge when streak is 3-9', () => {
            mockEngine.getState.mockImplementation(() => ({ streak: 5, score: 50, isFinished: false, currentQuestionIndex: 0 }));
            render(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            const badge = screen.getByText(/🔥 5/);
            expect(badge).toBeTruthy();
            // Check for gradient - browser converts hex to RGB
            expect(badge.style.background).toContain('linear-gradient');
        });

        it('should show blue hot badge when streak is 10-19', () => {
            mockEngine.getState.mockImplementation(() => ({ streak: 15, score: 50, isFinished: false, currentQuestionIndex: 0 }));
            render(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            // Blue tier uses img tag instead of emoji
            const img = screen.getByAltText('streak');
            expect(img).toBeTruthy();
            expect(img.getAttribute('src')).toContain('flame-blue.png');

            // Verify streak number is displayed
            expect(screen.getByText('15')).toBeTruthy();
        });

        it('should show purple legendary badge when streak is 20+', () => {
            mockEngine.getState.mockImplementation(() => ({ streak: 25, score: 50, isFinished: false, currentQuestionIndex: 0 }));
            render(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            // Purple tier uses img tag - get all imgs and find the purple one
            const imgs = screen.getAllByAltText('streak');
            const purpleImg = imgs.find(img => img.getAttribute('src').includes('flame-purple.png'));
            expect(purpleImg).toBeTruthy();

            // Verify streak number is displayed
            expect(screen.getByText('25')).toBeTruthy();
        });
    });

    describe('Achievement Triggers', () => {
        it('should trigger hot_streak achievement at exactly streak 10', async () => {
            let currentStreak = 9;
            mockEngine.getState.mockImplementation(() => ({
                streak: currentStreak,
                score: 50,
                isFinished: false,
                currentQuestionIndex: currentStreak
            }));

            const { rerender } = render(
                <QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />
            );

            // Simulate answering correctly to reach streak 10
            mockEngine.answer.mockReturnValue(true);
            currentStreak = 10;

            const optionButtons = screen.getAllByText('A');
            fireEvent.click(optionButtons[0]); // Click first matching button

            await waitFor(() => {
                expect(mockEconomy.achievements.updateStats).toHaveBeenCalledWith({ quizStreak10: 1 });
            });
        });

        it('should trigger legendary_streak achievement at exactly streak 20', async () => {
            let currentStreak = 19;
            mockEngine.getState.mockImplementation(() => ({
                streak: currentStreak,
                score: 50,
                isFinished: false,
                currentQuestionIndex: currentStreak
            }));

            render(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            // Simulate answering correctly to reach streak 20
            mockEngine.answer.mockReturnValue(true);
            currentStreak = 20;

            const optionButtons = screen.getAllByText('A');
            fireEvent.click(optionButtons[0]); // Click first matching button

            await waitFor(() => {
                expect(mockEconomy.achievements.updateStats).toHaveBeenCalledWith({ quizStreak20: 1 });
            });
        });

        it('should not trigger achievements at other streak values', async () => {
            mockEngine.getState.mockReturnValue({ streak: 5, score: 50, isFinished: false, currentQuestionIndex: 0 });
            mockEngine.answer.mockReturnValue(true);

            render(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            const optionButtons = screen.getAllByText('A');
            fireEvent.click(optionButtons[0]); // Click first matching button

            await waitFor(() => {
                expect(mockEconomy.achievements.updateStats).not.toHaveBeenCalled();
            });
        });
    });

    describe('Visual Gradient Transitions', () => {
        it('should transition from orange to blue at streak 10', () => {
            // Start at streak 9 (orange - emoji)
            mockEngine.getState.mockReturnValue({ streak: 9, score: 50, isFinished: false, currentQuestionIndex: 0 });
            const { rerender } = render(
                <QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />
            );

            let badge = screen.getByText(/🔥 9/);
            expect(badge).toBeTruthy();

            // Transition to streak 10 (blue - img)
            mockEngine.getState.mockReturnValue({ streak: 10, score: 50, isFinished: false, currentQuestionIndex: 0 });
            rerender(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            const img = screen.getByAltText('streak');
            expect(img.getAttribute('src')).toContain('flame-blue.png');
            expect(screen.getByText('10')).toBeTruthy();
        });

        it('should transition from blue to purple at streak 20', () => {
            // Start at streak 19 (blue - img)
            mockEngine.getState.mockReturnValue({ streak: 19, score: 50, isFinished: false, currentQuestionIndex: 0 });
            const { rerender } = render(
                <QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />
            );

            let img = screen.getByAltText('streak');
            expect(img.getAttribute('src')).toContain('flame-blue.png');

            // Transition to streak 20 (purple - img)
            mockEngine.getState.mockReturnValue({ streak: 20, score: 50, isFinished: false, currentQuestionIndex: 0 });
            rerender(<QuizView engine={mockEngine} economy={mockEconomy} onFinish={mockOnFinish} />);

            img = screen.getByAltText('streak');
            expect(img.getAttribute('src')).toContain('flame-purple.png');
            expect(screen.getByText('20')).toBeTruthy();
        });
    });
});

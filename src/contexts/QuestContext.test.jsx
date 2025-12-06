import { render, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestProvider, useQuests } from './QuestContext';
import React from 'react';

// Mock dependencies
const mockEngine = {
    getThemes: () => ['All', 'Nature', 'Space'],
    getThemeMastery: vi.fn()
};

const mockAchievements = {
    unlock: vi.fn()
};

describe('QuestContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('initializes quests from engine themes', () => {
        const wrapper = ({ children }) => (
            <QuestProvider engine={mockEngine} achievements={mockAchievements}>
                {children}
            </QuestProvider>
        );

        const { result } = renderHook(() => useQuests(), { wrapper });

        expect(result.current.quests).toHaveProperty('Nature');
        expect(result.current.quests).toHaveProperty('Space');
        expect(result.current.quests.Nature.status).toBe('active');
    });

    it('updates progress and completes quest', () => {
        const wrapper = ({ children }) => (
            <QuestProvider engine={mockEngine} achievements={mockAchievements}>
                {children}
            </QuestProvider>
        );

        const { result } = renderHook(() => useQuests(), { wrapper });

        // Simulate mastery update
        mockEngine.getThemeMastery.mockReturnValue(5); // Max mastery

        act(() => {
            const completed = result.current.checkQuestCompletion('Nature');
            expect(completed).toBe(true);
        });

        expect(result.current.quests.Nature.isCompleted).toBe(true);
        expect(result.current.quests.Nature.progress).toBe(1);
        expect(mockAchievements.unlock).toHaveBeenCalledWith('quest_Nature');
    });

    it('persists quest state to localStorage', () => {
        const wrapper = ({ children }) => (
            <QuestProvider engine={mockEngine} achievements={mockAchievements}>
                {children}
            </QuestProvider>
        );

        const { result } = renderHook(() => useQuests(), { wrapper });

        mockEngine.getThemeMastery.mockReturnValue(5);

        act(() => {
            result.current.checkQuestCompletion('Space');
        });

        const saved = JSON.parse(localStorage.getItem('quest_Space'));
        expect(saved.isCompleted).toBe(true);
    });
});

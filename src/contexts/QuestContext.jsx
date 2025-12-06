import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const QuestContext = createContext(null);

export function QuestProvider({ children, engine, achievements }) {
    const [quests, setQuests] = useState({});

    // Initialize quests from engine themes
    useEffect(() => {
        if (!engine) return;

        const themes = engine.getThemes().filter(t => t !== 'All');
        const initialQuests = {};

        themes.forEach(theme => {
            // Load from storage or default
            const saved = localStorage.getItem(`quest_${theme}`);
            if (saved) {
                initialQuests[theme] = JSON.parse(saved);
            } else {
                initialQuests[theme] = {
                    id: theme,
                    status: 'active', // All quests active by default for now
                    progress: 0,
                    isCompleted: false
                };
            }
        });

        setQuests(prev => ({ ...initialQuests, ...prev }));
    }, [engine]);

    const checkQuestCompletion = useCallback((theme) => {
        if (!engine || !theme || theme === 'All') return;

        const themeMastery = engine.getThemeMastery(theme); // 0-5
        // Quest complete if mastery is 5 (approx E-Factor >= 2.5 average)
        // Or we can check individual words if engine exposes that.
        // For MVP, let's trust getThemeMastery returning 5 as "Complete"

        const isComplete = themeMastery >= 5;

        setQuests(prev => {
            const current = prev[theme] || { id: theme, status: 'active', progress: 0 };

            // Calculate progress (0 to 1)
            const progress = Math.min(1, themeMastery / 5);

            if (isComplete && !current.isCompleted) {
                // Quest Just Completed!
                if (achievements) {
                    achievements.unlock(`quest_${theme}`);
                }

                const updated = {
                    ...current,
                    status: 'completed',
                    progress: 1,
                    isCompleted: true,
                    completedAt: new Date().toISOString()
                };
                localStorage.setItem(`quest_${theme}`, JSON.stringify(updated));
                return { ...prev, [theme]: updated };
            }

            // Update progress
            const updated = {
                ...current,
                progress: progress
            };
            // Only save if changed significantly to avoid spamming storage
            if (Math.abs(updated.progress - current.progress) > 0.1) {
                localStorage.setItem(`quest_${theme}`, JSON.stringify(updated));
            }

            return { ...prev, [theme]: updated };
        });

        return isComplete;
    }, [engine, achievements]);

    return (
        <QuestContext.Provider value={{ quests, checkQuestCompletion }}>
            {children}
        </QuestContext.Provider>
    );
}

export function useQuests() {
    const context = useContext(QuestContext);
    if (!context) {
        throw new Error('useQuests must be used within a QuestProvider');
    }
    return context;
}

import React, { createContext, useContext, useMemo } from 'react';
import { QuizEngine } from '../engine/QuizEngine';
import { Economy } from '../engine/Economy';
import { Achievements } from '../engine/Achievements';
import { EventService } from '../services/EventService';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    // Singleton instances
    const engine = useMemo(() => new QuizEngine(), []);
    const economy = useMemo(() => new Economy(), []);
    const achievements = useMemo(() => new Achievements(), []);
    const eventService = useMemo(() => new EventService(), []);

    const value = {
        engine,
        economy,
        achievements,
        eventService
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}

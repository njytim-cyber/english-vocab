import React from 'react';
import { colors, borderRadius, shadows, icons } from '../styles/designTokens';

/**
 * NavBar - Bottom navigation (5 items)
 * 
 * Learn | Games | Revise | Arena | Progress
 * (Rewards accessible via HUD star icon)
 */

const NAV_ITEMS = [
    { id: 'learn', label: 'Learn', icon: icons.learn, matchViews: ['learn', 'quiz-setup', 'quiz'] },
    { id: 'practice', label: 'Revise', icon: '🔄', matchViews: ['practice'] },
    { id: 'minigames', label: 'Games', icon: '🎮', matchViews: ['minigames', 'game-'] },
    { id: 'arena', label: 'Arena', icon: '⚔️', matchViews: ['arena'] },
    { id: 'skills', label: 'Progress', icon: icons.progress, matchViews: ['skills', 'stickers', 'certificate'] }
];

export default function NavBar({ currentView, onViewChange }) {
    const isActive = (item) => {
        return item.matchViews.some(v =>
            v.endsWith('-') ? currentView.startsWith(v) : currentView === v
        );
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0.6rem 0.5rem',
            background: colors.white,
            boxShadow: '0 -2px 15px rgba(0,0,0,0.06)',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderTop: `1px solid ${colors.border}`
        }}>
            {NAV_ITEMS.map(item => {
                const active = isActive(item);

                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        aria-label={item.label}
                        aria-current={active ? 'page' : undefined}
                        style={{
                            background: active ? `${colors.primary}15` : 'transparent',
                            color: active ? colors.primary : colors.textMuted,
                            padding: '0.4rem 0.5rem',
                            borderRadius: borderRadius.sm,
                            fontSize: '0.7rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.1rem',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: active ? '600' : '500',
                            minWidth: '50px'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

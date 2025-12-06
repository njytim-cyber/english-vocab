import React from 'react';
import { colors, borderRadius, shadows, icons } from '../styles/designTokens';

/**
 * NavBar - Streamlined bottom navigation
 * 
 * New structure:
 * - "Learn" is the hub (New Quiz, Practice, Arena, Quests, Games)
 * - "Progress" for skills and achievements
 * - "Rewards" for shop and cosmetics
 */

const NAV_ITEMS = [
    { id: 'learn', label: 'Vocab', icon: icons.learn, matchViews: ['learn', 'quiz-setup', 'quiz', 'practice', 'arena', 'quests', 'minigames', 'game-'] },
    { id: 'skills', label: 'Progress', icon: icons.progress, matchViews: ['skills', 'stickers', 'certificate'] },
    { id: 'shop', label: 'Rewards', icon: icons.rewards, matchViews: ['shop'] }
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
                            background: active ? colors.primaryGradient : 'transparent',
                            color: active ? colors.white : colors.textMuted,
                            padding: '0.4rem 0.7rem',
                            borderRadius: borderRadius.lg,
                            fontSize: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.15rem',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: active ? '600' : '500',
                            boxShadow: active ? shadows.primary : 'none',
                            minWidth: '56px'
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

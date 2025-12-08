import React from 'react';
import PageLayout from '../common/PageLayout';
import { colors, borderRadius, shadows } from '../../styles/designTokens';

export default function MinigameHub({ onSelectGame, onBack }) {
    const games = [
        {
            id: 'game-wordsearch',
            title: 'Word Search',
            icon: '🔍',
            description: 'Find hidden words in the grid.'
        },
        {
            id: 'game-definition',
            title: 'Sentence Match',
            icon: '🧠',
            description: 'Match words to the correct sentence.'
        },
        {
            id: 'game-hangman',
            title: 'Letter Deduction',
            icon: '🕵️',
            description: 'Guess the word letter by letter.'
        },
        {
            id: 'game-scramble',
            title: 'Word Scramble',
            icon: '🌪️',
            description: 'Unscramble the jumbled letters.'
        },
        {
            id: 'game-ladder',
            title: 'Word Ladder',
            icon: '🪜',
            description: 'Transform one word to another.'
        }
    ];

    return (
        <PageLayout title="Games 🎮" onBack={onBack} maxWidth="900px">
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem'
            }}>
                {games.map(game => (
                    <button
                        key={game.id}
                        onClick={() => onSelectGame(game.id)}
                        style={{
                            background: colors.white,
                            color: colors.dark,
                            border: `2px solid ${colors.border}`,
                            borderRadius: borderRadius.xl,
                            padding: '2rem 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            boxShadow: shadows.md,
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                            e.currentTarget.style.boxShadow = shadows.lg;
                            e.currentTarget.style.borderColor = colors.primary;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = shadows.md;
                            e.currentTarget.style.borderColor = colors.border;
                        }}
                    >
                        {/* Subtle gradient overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${colors.primary}05 0%, transparent 100%)`,
                            pointerEvents: 'none'
                        }} />

                        <div style={{ fontSize: '3.5rem', position: 'relative', zIndex: 1 }}>{game.icon}</div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: colors.dark,
                            position: 'relative',
                            zIndex: 1
                        }}>{game.title}</div>
                        <div style={{
                            fontSize: '0.85rem',
                            color: colors.textMuted,
                            lineHeight: '1.4',
                            position: 'relative',
                            zIndex: 1
                        }}>{game.description}</div>
                    </button>
                ))}
            </div>
        </PageLayout>
    );
}

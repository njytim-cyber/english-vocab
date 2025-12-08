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
                gap: '1rem'
            }}>
                {games.map(game => (
                    <button
                        key={game.id}
                        onClick={() => onSelectGame(game.id)}
                        style={{
                            background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.light} 100%)`,
                            color: colors.dark,
                            border: `2px solid ${colors.border}`,
                            borderRadius: borderRadius.lg,
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.6rem',
                            cursor: 'pointer',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s',
                            boxShadow: shadows.md,
                            textAlign: 'center'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                            e.currentTarget.style.boxShadow = shadows.lg;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = shadows.md;
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>{game.icon}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.dark }}>{game.title}</div>
                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>{game.description}</div>
                    </button>
                ))}
            </div>
        </PageLayout>
    );
}

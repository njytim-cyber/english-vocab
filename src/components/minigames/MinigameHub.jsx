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
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                paddingBottom: '20px'
            }}>
                {games.map((game, index) => {
                    // Bento Logic: First item spans full width
                    const isFeatured = index === 0;

                    return (
                        <button
                            key={game.id}
                            onClick={() => onSelectGame(game.id)}
                            style={{
                                gridColumn: isFeatured ? '1 / -1' : 'auto',
                                background: colors.white,
                                color: colors.dark,
                                border: 'none', // Cleaner look for bento
                                borderRadius: borderRadius.xl,
                                padding: isFeatured ? '1.5rem' : '1rem',
                                display: 'flex',
                                flexDirection: isFeatured ? 'row' : 'column',
                                alignItems: 'center',
                                justifyContent: isFeatured ? 'flex-start' : 'center',
                                textAlign: isFeatured ? 'left' : 'center',
                                gap: isFeatured ? '1.5rem' : '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: shadows.sm,
                                position: 'relative',
                                overflow: 'hidden',
                                height: '100%' // Fill grid cell
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = shadows.md;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = shadows.sm;
                            }}
                        >
                            {/* Accents for bento feel */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                background: index % 2 === 0 ? colors.primary : colors.secondary
                            }} />

                            <div style={{
                                fontSize: isFeatured ? '3rem' : '2.2rem',
                                lineHeight: 1
                            }}>
                                {game.icon}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: isFeatured ? '1.3rem' : '1rem',
                                    fontWeight: '700',
                                    color: colors.dark,
                                    marginBottom: '4px'
                                }}>{game.title}</div>

                                <div style={{
                                    fontSize: '0.8rem',
                                    color: colors.textMuted,
                                    lineHeight: '1.3',
                                    display: isFeatured ? 'block' : 'none' // Hide desc on small tiles for space
                                }}>{game.description}</div>
                            </div>

                            {/* Play arrow for featured item */}
                            {isFeatured && (
                                <div style={{
                                    fontSize: '1.5rem',
                                    color: colors.primary,
                                    fontWeight: 'bold'
                                }}>
                                    →
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </PageLayout>
    );
}

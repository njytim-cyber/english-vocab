import React from 'react';
import PageLayout from '../common/PageLayout';
import { colors, borderRadius, shadows } from '../../styles/designTokens';

export default function MinigameHub({ onSelectGame, onBack }) {
    const games = [
        {
            id: 'game-wordsearch',
            title: 'Word Search',
            icon: '🔍',
            description: 'Find hidden words in the grid.',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            id: 'game-definition',
            title: 'Sentence Match',
            icon: '🧠',
            description: 'Match words to the correct sentence.',
            gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
        },
        {
            id: 'game-hangman',
            title: 'Letter Deduction',
            icon: '🕵️',
            description: 'Guess the word letter by letter.',
            gradient: 'linear-gradient(135deg, #667eea 0%, #a855f7 100%)'
        },
        {
            id: 'game-scramble',
            title: 'Word Scramble',
            icon: '🌪️',
            description: 'Unscramble the jumbled letters.',
            gradient: 'linear-gradient(135deg, #a855f7 0%, #764ba2 100%)'
        },
        {
            id: 'game-ladder',
            title: 'Word Ladder',
            icon: '🪜',
            description: 'Transform one word to another.',
            gradient: 'linear-gradient(135deg, #764ba2 0%, #a855f7 100%)'
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
                            background: game.gradient,
                            color: 'white',
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.6rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: shadows.md,
                            textAlign: 'center'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = shadows.md;
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>{game.icon}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{game.title}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{game.description}</div>
                    </button>
                ))}
            </div>
        </PageLayout>
    );
}

import React from 'react';

export default function MinigameHub({ onSelectGame, onBack }) {
    const games = [
        {
            id: 'game-wordsearch',
            title: 'Word Search',
            icon: '🔍',
            description: 'Find hidden words in the grid.',
            color: '#4ECDC4'
        },
        {
            id: 'game-definition',
            title: 'Definition Match',
            icon: '🧠',
            description: 'Match words to their meanings.',
            color: '#FF6B6B'
        },
        {
            id: 'game-hangman',
            title: 'Letter Deduction',
            icon: '🕵️',
            description: 'Guess the word letter by letter.',
            color: '#FFE66D',
            textColor: '#333'
        },
        {
            id: 'game-scramble',
            title: 'Word Scramble',
            icon: '🌪️',
            description: 'Unscramble the jumbled letters.',
            color: '#1A535C'
        },
        {
            id: 'game-ladder',
            title: 'Word Ladder',
            icon: '🪜',
            description: 'Transform one word to another.',
            color: '#F7FFF7',
            textColor: '#333'
        }
    ];

    return (
        <div className="minigame-hub" style={{
            minHeight: '100vh',
            padding: '2rem',
            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        fontSize: '1rem'
                    }}
                >
                    ← Back to Home
                </button>

                <h1 style={{
                    textAlign: 'center',
                    fontSize: '3rem',
                    marginBottom: '3rem',
                    textShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                    Games 🕹️
                </h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {games.map(game => (
                        <button
                            key={game.id}
                            onClick={() => onSelectGame(game.id)}
                            style={{
                                background: game.color,
                                color: game.textColor || 'white',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                textAlign: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                            }}
                        >
                            <div style={{ fontSize: '4rem' }}>{game.icon}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{game.title}</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{game.description}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

import React from 'react';

export default function NavBar({ currentView, onViewChange }) {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'white',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100
        }}>
            <div
                onClick={() => onViewChange('start')}
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <span>🏠</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => onViewChange('start')}
                    style={{
                        background: currentView === 'start' || currentView === 'quiz-setup' ? 'var(--secondary)' : 'transparent',
                        color: currentView === 'start' || currentView === 'quiz-setup' ? 'white' : 'var(--dark)',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <span>⚔️</span> Quiz
                </button>

                <button
                    onClick={() => onViewChange('minigames')}
                    style={{
                        background: currentView === 'minigames' || currentView.startsWith('game-') ? 'var(--secondary)' : 'transparent',
                        color: currentView === 'minigames' || currentView.startsWith('game-') ? 'white' : 'var(--dark)',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    aria-label="Games"
                >
                    <span>🕹️</span> Games
                </button>

                <button
                    onClick={() => onViewChange('skills')}
                    style={{
                        background: currentView === 'skills' ? 'var(--secondary)' : 'transparent',
                        color: currentView === 'skills' ? 'white' : 'var(--dark)',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <span>🌱</span> Skills
                </button>

                <button
                    onClick={() => onViewChange('stickers')}
                    style={{
                        background: currentView === 'stickers' ? 'var(--secondary)' : 'transparent',
                        color: currentView === 'stickers' ? 'white' : 'var(--dark)',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <span>🏆</span> Stickers
                </button>
                <button
                    onClick={() => onViewChange('shop')}
                    style={{
                        background: currentView === 'shop' ? 'var(--secondary)' : 'transparent',
                        color: currentView === 'shop' ? 'white' : 'var(--dark)',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <span>🛒</span> Shop
                </button>
            </div>
        </nav>
    );
}

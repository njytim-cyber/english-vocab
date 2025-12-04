import React, { useState } from 'react';

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🦄'];

export default function StartScreen({ onNavigate, engine }) {
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            paddingBottom: '100px', // Space for NavBar
            background: 'var(--light)',
            color: 'var(--dark)'
        }}>
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Home Base 🏠</h1>
                <div style={{
                    background: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span>💎</span>
                    <strong>{engine ? engine.state.score : 0}</strong>
                </div>
            </div>

            <div className="card" style={{
                padding: '2rem',
                width: '100%',
                maxWidth: '500px',
                marginBottom: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                    {selectedAvatar}
                </div>
                <h2 style={{ marginBottom: '1rem' }}>Ready for Adventure?</h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    {AVATARS.map(avatar => (
                        <button
                            key={avatar}
                            onClick={() => setSelectedAvatar(avatar)}
                            style={{
                                fontSize: '1.5rem',
                                padding: '0.5rem',
                                background: selectedAvatar === avatar ? 'rgba(0,0,0,0.1)' : 'transparent',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {avatar}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{
                width: '100%',
                maxWidth: '500px',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <button
                    onClick={() => onNavigate('quiz-setup')}
                    style={{
                        width: '100%',
                        padding: '2rem',
                        fontSize: '1.5rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)'
                    }}
                >
                    <span>⚔️</span> Start Quiz
                </button>
            </div>
        </div>
    );
}

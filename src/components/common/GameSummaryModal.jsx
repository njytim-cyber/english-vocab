import React, { useEffect } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';

export default function GameSummaryModal({ score, xp, coins, onReplay, onBack }) {
    useEffect(() => {
        triggerConfetti();
        speak(`Level Complete! You earned ${xp} XP and ${coins} coins.`);
    }, [xp, coins]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div className="card animate-pop" style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '20px',
                textAlign: 'center',
                maxWidth: '90%',
                width: '400px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
                <h2 style={{
                    fontSize: '2.5rem',
                    color: 'var(--primary)',
                    margin: '0 0 1rem 0',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                }}>
                    Level Complete!
                </h2>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', color: '#666' }}>XP</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#BB8FCE' }}>+{xp}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', color: '#666' }}>Coins</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F1C40F' }}>+{coins}</div>
                    </div>
                </div>

                {score !== undefined && (
                    <div style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
                        Score: <strong>{score}</strong>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={onReplay}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 0 #2c3e50',
                            transition: 'transform 0.1s'
                        }}
                    >
                        Play Again 🔄
                    </button>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            background: '#eee',
                            color: '#666',
                            border: 'none',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Back to Arcade 🏠
                    </button>
                </div>
            </div>
        </div>
    );
}

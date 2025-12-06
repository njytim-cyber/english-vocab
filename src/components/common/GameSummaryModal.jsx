import { useEffect } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { colors, borderRadius, shadows } from '../../styles/designTokens';
import { StarReward } from './StarDisplay';

export default function GameSummaryModal({ score, xp, coins, onReplay, onBack }) {
    useEffect(() => {
        triggerConfetti();
        speak(`Level Complete! You earned ${xp} XP and ${coins} Stars!`);
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
            zIndex: 1000
        }}>
            <div className="animate-pop" style={{
                background: colors.white,
                padding: '2.5rem',
                borderRadius: borderRadius.xl,
                textAlign: 'center',
                maxWidth: '90%',
                width: '380px',
                boxShadow: shadows.lg
            }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🏆</div>
                <h2 style={{
                    fontSize: '1.8rem',
                    color: colors.primary,
                    margin: '0 0 1rem 0'
                }}>
                    Level Complete!
                </h2>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>XP</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: colors.primary }}>+{xp}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>Stars</div>
                        <StarReward amount={coins} />
                    </div>
                </div>

                {score !== undefined && score !== null && (
                    <div style={{ marginBottom: '1.5rem', fontSize: '1rem', color: colors.dark }}>
                        Score: <strong>{score}</strong>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={onReplay}
                        style={{
                            padding: '0.9rem 1.5rem',
                            fontSize: '1rem',
                            background: colors.primaryGradient,
                            color: 'white',
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: shadows.primary
                        }}
                    >
                        Play Again 🔄
                    </button>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '0.9rem 1.5rem',
                            fontSize: '1rem',
                            background: colors.light,
                            color: colors.textMuted,
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Back to Games 🏠
                    </button>
                </div>
            </div>
        </div>
    );
}
